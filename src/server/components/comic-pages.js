export async function generate(srcURL) {
    const parsableSites = ['readallcomics.com']
    if (!srcURL || !parsableSites.some(site => srcURL.includes(site))) return ''

    try {

        // Collect all img URLs
        const siteHTML = await (await fetch(srcURL)).text(),
              imgPattern = /<img[^>]+src="([^"]+)"[^>]*>/gi,
              imgURLs = []
        let imgMatch
        while ((imgMatch = imgPattern.exec(siteHTML)) != null) imgURLs.push(imgMatch[1])
        if (!imgURLs.length) return ''

        // Count domains
        const domainCnts = {}
        imgURLs.forEach(src => {
            try {
                const url = new URL(src), hostname = url.hostname, domainParts = hostname.split('.')
                const domain = domainParts.length >= 2 ? domainParts.slice(-2).join('.') : hostname
                domainCnts[domain] = (domainCnts[domain] || 0) +1
            } catch (err) {}
        })

        // Get domain w/ most imgs
        let mostCommonDomain = '', maxCnt = 0
        for (const [domain, cnt] of Object.entries(domainCnts))
            if (cnt > maxCnt) { maxCnt = cnt ; mostCommonDomain = domain }

        // Extract interior page URLs
        const interiorPageURLs = imgURLs.filter(src => {
            try {
                const url = new URL(src), hostname = url.hostname, domainParts = hostname.split('.')
                const domain = domainParts.length >= 2 ? domainParts.slice(-2).join('.') : hostname
                return domain == mostCommonDomain
            } catch (err) { return false }
        }).slice(1) // skip 1st img (cover)

        return !interiorPageURLs.length ? '' : `
            <div class="comic-pages">
                <div class="comic-pages-title">INTERIOR PAGES (OF REFERENCE COPY)</div>
                ${interiorPageURLs.map((src, idx) => `
                    <div class="comic-page">
                        <img src="${src}" loading="lazy">
                        <div class="page-number">PAGE ${ idx +1 }</div>
                    </div>
                `).join('')}
            </div>
        `
    } catch (err) { return '' }
}
