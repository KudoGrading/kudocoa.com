export async function generate(srcURL) {
    console.log('comicPages.generate() running...')
    const parsableSites = ['readallcomics.com']
    if (!srcURL || !parsableSites.some(site => srcURL.includes(site))) {
        console.error(srcURL + ' is not parsable!') ; return '' }

    try {

        console.log('Collecting all img URLs...')
        const imgMatches = (await (await fetch(srcURL)).text()).matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi),
              imgURLs = Array.from(imgMatches, match => match[1])
        if (imgURLs.length) console.log('Total images found:', imgURLs.length)
        else { console.log('No images found!') ; return '' }

        console.log('Counting domains...') // by last two segments of hostname to support variations in earlier segments
        const domainCnts = {}
        imgURLs.forEach(src => {
            try {
                const url = new URL(src),
                      domainParts = url.hostname.split('.'),
                      domain = domainParts.length >= 2 ? domainParts.slice(-2).join('.') : url.hostname
                domainCnts[domain] = (domainCnts[domain] || 0) +1
            } catch (err) {}
        })
        for (const [domain, cnt] of Object.entries(domainCnts))
            console.log(`Domain ${domain}: ${cnt} images`)

        console.log('Calculating domain w/ most imgs...')
        let mostCommonDomain = '', maxCnt = 0
        for (const [domain, cnt] of Object.entries(domainCnts))
            if (cnt > maxCnt) { maxCnt = cnt ; mostCommonDomain = domain }
        console.log(`Most common domain: ${mostCommonDomain} (${maxCnt} images)`)

        console.log('Extracing interior page URLs...')
        const interiorPageURLs = imgURLs.filter(src => {
            try {
                const url = new URL(src),
                      domainParts = url.hostname.split('.'),
                      domain = domainParts.length >= 2 ? domainParts.slice(-2).join('.') : url.hostname
                return domain == mostCommonDomain
            } catch (err) { return false }
        }).slice(1) // skip 1st img (cover)

        console.log(`${interiorPageURLs.length} page URLs extracted! Generating HTML...`)

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
    } catch (err) { console.error('Error generating comic pages:', err.message) ; return '' }
}
