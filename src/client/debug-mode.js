import { createLogger } from '../shared/lib/log.js'

export function initDebugMode() { // append ?debug to all app links
    if (!location.search.includes('debug')) return
    const log = createLogger({ prefix: 'initDebugMode()', debugMode: true })
    log.debug('Initializing app links...')
    let linksChangedCnt = 0
    document.querySelectorAll('a[href]').forEach(link => {
        if (link.href.includes(location.origin)) { // change app links
            const url = new URL(link.href)
            if (!url.search) { url.search = '?debug' ; link.href = url.toString() ; linksChangedCnt++ }
        }
    })
    log.debug(`${ linksChangedCnt || 'No' } link${ linksChangedCnt == 1 ? '' : 's' } changed!`)
}
