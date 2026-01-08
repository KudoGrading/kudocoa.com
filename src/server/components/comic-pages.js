import { createLogger } from '../../shared/lib/log.js'

export { default as css } from '../../../public/css/components/server/comic-pages.min.css'

export async function generate({ srcURL, debugMode = false }) {
    const log = createLogger({ prefix: 'comicPages.generate()', debugMode }),
          parsableSites = ['readallcomics.com']
    if (!srcURL || !parsableSites.some(site => srcURL.includes(site))) {
        log.error(srcURL + ' is not parsable!') ; return '' }

    try {

        log.debug('Collecting all img URLs...')
        const imgMatches = (await (await fetch(srcURL)).text()).matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi),
              imgURLs = Array.from(imgMatches, match => match[1])
        if (imgURLs.length) log.debug('Total images found:', imgURLs.length)
        else { log.debug('No images found!') ; return '' }

        log.debug('Counting domains...') // by last two segments of hostname to support variations
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
            log.debug(`Domain ${domain}: ${cnt} images`)

        log.debug('Calculating domain w/ most imgs...')
        let mostCommonDomain = '', maxCnt = 0
        for (const [domain, cnt] of Object.entries(domainCnts))
            if (cnt > maxCnt) { maxCnt = cnt ; mostCommonDomain = domain }
        log.debug(`Most common domain: ${mostCommonDomain} (${maxCnt} images)`)

        log.debug('Extracing interior page URLs...')
        const interiorPageURLs = imgURLs.filter(src => {
            try {
                const url = new URL(src),
                      domainParts = url.hostname.split('.'),
                      domain = domainParts.length >= 2 ? domainParts.slice(-2).join('.') : url.hostname
                return domain == mostCommonDomain
            } catch (err) { return false }
        }).slice(1) // skip 1st img (cover)

        log.debug(`${interiorPageURLs.length} page URLs extracted!`)
        if (interiorPageURLs.length) log.debug('Generating HTML...')

        return !interiorPageURLs.length ? '' : `
            <div class="comic-pages">
                <div class="comic-pages-title">Interior Pages (of reference copy)</div>
                ${interiorPageURLs.map((src, idx) => `
                    <div class="comic-page">
                        <img src="${src}" loading="lazy">
                        <div class="page-number">Page ${ idx +1 }</div>
                    </div>
                `).join('')}
            </div>
        `
    } catch (err) { log.error('Error generating comic pages:', err.message) ; return '' }
}
