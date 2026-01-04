import { initSearch } from '../shared/verify.js'
import { initDownloadBtns } from '../shared/download.js'
import { initBackToTop } from '../shared/back-to-top.js'
import { initItemShot } from '../components/item-shot.js'
import { initNavArrows } from '../components/nav-arrows.js'
import { zoomImg } from '../components/zoom/index.js'

export function initCertPage(config) {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum'),
              btn = document.getElementById('verifyBtn')
        initSearch({ input, btn, baseURL: config.baseURL })
        resetUI() ; addEventListener('pageshow', resetUI)
        function resetUI() {
            btn.disabled = false ; btn.textContent = 'Verify Certificate'
            const val = input.value ; input.value = '' ; input.value = val ; input.blur()
        }
        initNavArrows(config)
        initDownloadBtns()
        //initItemShot({ certID: config.certID, baseURLs: config.urls })
        document.querySelector('.coa-img')?.addEventListener('click', () =>
            zoomImg({ title: 'Certificate',
                imgURL: `${config.urls.jsdelivr}/certificates/coas/${config.certID}/certificate.png` })
        )
        initBackToTop()
    })
}
