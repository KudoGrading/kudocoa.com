import { zoomImg } from '../lib/zoom.js'
import { initBackToTop } from '../components/back-to-top.js'
import { initDownloadBtns } from '../components/download.js'
import { initSearch } from '../components/verify.js'
import { initItemShot } from '../components/item-shot.js'
import * as navArrows from '../components/nav-arrows.js'

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
        navArrows.createAppend(config)
        initDownloadBtns()
        initItemShot(config)
        document.querySelector('.coa-img')?.addEventListener('click', () =>
            zoomImg({ title: 'Certificate',
                imgURL: `${config.jsdURL}/certificates/coas/${config.certID}/certificate.png` })
        )
        initBackToTop()
    })
}
