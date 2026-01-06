
import { initDownloadBtns } from './download-btns.js'
import { initItemShot } from './item-shot.js'
import { zoomImg } from './zoom.js'
import { initBackToTop } from '../../components/back-to-top.js'
import * as navArrows from '../../components/nav-arrows.js'
import * as search from '../../components/search.js'

export function initCertPage(config) {
    document.addEventListener('DOMContentLoaded', () => {
        search.init({ input: document.getElementById('certNum'), focus: false })
        navArrows.createAppend()
        initDownloadBtns()
        initItemShot()
        document.querySelector('.coa-img')?.addEventListener('click', () => zoomImg({
            title: 'Certificate', imgURL: `${config.jsdURL}/certificates/coas/${config.certID}/certificate.png` }))
        initBackToTop()
    })
}
