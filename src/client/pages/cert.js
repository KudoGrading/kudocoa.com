import { initSearch } from '../shared/verify.js'
import { initDownloadButtons } from '../shared/download.js'
import { initBackToTop } from '../shared/back-to-top.js'
import { initItemShot } from '../components/item-shot.js'
import { initNavArrows } from '../components/nav-arrows.js'
import { zoomImg } from '../components/zoom/index.js'

export function initCertPage(config) {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum'),
              button = document.getElementById('verifyBtn')
        initSearch(input, button, config.baseURL)
        resetUI() ; addEventListener('pageshow', resetUI)
        function resetUI() {
            button.disabled = false ; button.textContent = 'Verify Certificate'
            const val = input.value ; input.value = '' ; input.value = val ; input.blur()
        }
        initNavArrows(config.navArrowsHTML, config.prevCertNum, config.nextCertNum, config.baseURL)
        initDownloadButtons()
        initItemShot(config.certID, config.urls)
        document.querySelector('.coa-img')?.addEventListener('click', () =>
            zoomImg({ title: 'Certificate',
                imgURL: `${config.urls.jsdelivr}/certificates/coas/${config.certID}/certificate.png` })
        )
        initBackToTop()
    })
}
