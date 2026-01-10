import { createLogger } from '../../shared/lib/log.js'

export function createAppend() {
    const certID = /^\d{10}$/.exec(location.pathname.slice(1))?.[0] ; if (!certID) return
    const log = createLogger({ prefix: 'navArrows.createAppend()', debugMode: location.search.includes('debug') })

    log.debug('Initializing cert numbers...')
    const certNum = parseInt(certID),
          prevCertNum = certNum > 1 ? String(certNum -1).padStart(10, '0') : null,
          nextCertNum = String(certNum +1).padStart(10, '0')

    log.debug('Initializing HTML...')
    const navArrowsHTML = `
        <div class="nav-arrows">
            ${ prevCertNum ?
                `<a href="/${prevCertNum}${location.search}"
                    class="nav-arrow left" title="Previous Certificate">&lt;</a>`
              : '<span class="nav-arrow left disabled" title="No Previous Certificate">&lt;</span>'
            }
            <a href="/${nextCertNum}${location.search}" class="nav-arrow right" title="Next Certificate">&lt;</a>
        </div>
    `
    log.debug('Appending arrows...')
    document.body.insertAdjacentHTML('afterbegin', navArrowsHTML)

    log.debug('Adding key listener...')
    document.addEventListener('keydown', ({ key }) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
        if (key == 'ArrowLeft' && prevCertNum) location.href = `/${prevCertNum}${location.search}`
        else if (key == 'ArrowRight') location.href = `/${nextCertNum}${location.search}`
    })

    log.debug('Successfully completed!')
}
