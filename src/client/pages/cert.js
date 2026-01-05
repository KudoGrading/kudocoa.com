import { zoomImg } from '../lib/zoom.js'
import { initBackToTop } from '../components/back-to-top.js'
import { initDownloadBtns } from '../components/download.js'
import { initItemShot } from '../components/item-shot.js'
import * as navArrows from '../components/nav-arrows.js'
import * as search from '../components/search.js'

export function initCertPage(config) {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum'),
              btn = document.getElementById('verifyBtn')
        search.init({ input, btn, baseURL: config.baseURL })
        addEventListener('pageshow', () => search.reset({ input, btn }))
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
