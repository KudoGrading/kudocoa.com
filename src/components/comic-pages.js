export async function generate(certData) {
    const { interiorURL } = certData
    if (!interiorURL || !interiorURL.includes('readallcomics.com')) return ''

    try {
        const pagesHTML = await (await fetch(interiorURL)).text()
        const imgPattern = /<img[^>]+src="([^"]+)"[^>]*>/gi
        const matches = []
        let match

        // Collect ALL image URLs
        while ((match = imgPattern.exec(pagesHTML)) != null) {
            matches.push(match[1])
        }

        if (!matches.length) return ''

        // Find most common domain (using last 2 segments to handle subdomains)
        const domainCounts = {}
        matches.forEach(src => {
            try {
                const url = new URL(src)
                const hostname = url.hostname
                // Extract domain without subdomain (last 2 segments)
                const parts = hostname.split('.')
                const domain = parts.length >= 2
                    ? parts.slice(-2).join('.')  // Get last 2 parts like "blogspot.com"
                    : hostname
                domainCounts[domain] = (domainCounts[domain] || 0) + 1
            } catch {}
        })

        // Get domain with most images
        let mostCommonDomain = ''
        let maxCount = 0
        for (const [domain, count] of Object.entries(domainCounts)) {
            if (count > maxCount) {
                maxCount = count
                mostCommonDomain = domain
            }
        }

        console.log('Most common domain:', mostCommonDomain, 'count:', maxCount)

        // Filter images from the most common domain (check if ends with the domain)
        const comicImages = matches.filter(src => {
            try {
                const url = new URL(src)
                const hostname = url.hostname
                const domainParts = hostname.split('.')
                const domain = domainParts.length >= 2
                    ? domainParts.slice(-2).join('.')
                    : hostname
                return domain == mostCommonDomain &&
                       !src.includes('/avatar-') &&
                       !src.includes('logo-') &&
                       !src.includes('icon.')
            } catch { return false }
        })

        // Skip first image (cover)
        const interiorPages = comicImages.slice(1)
        console.log('Found', interiorPages.length, 'interior pages')
        return !interiorPages.length ? '' : `
            <div class="comic-pages">
                <div class="comic-title">INTERIOR PAGES (OF REFERENCE COPY)</div>
                ${interiorPages.map((src, idx) => `
                    <div class="comic-page">
                        <img src="${src}" loading="lazy">
                        <div class="page-number">PAGE ${ idx +1 }</div>
                    </div>
                `).join('')}
            </div>
        `
    } catch (err) { console.error('Error fetching comic pages:', err) ; return '' }
}
