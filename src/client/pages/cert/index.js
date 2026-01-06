
import { initDownloadBtns } from './download-btns.js'
import { initItemShot } from './item-shot.js'
import { zoomImg } from './zoom.js'
import { initBackToTop } from '../../components/back-to-top.js'
import * as navArrows from '../../components/nav-arrows.js'
import * as search from '../../components/search.js'

export function initCertPage(config) {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum'),
              searchConfig = { input, focus: false }
        search.init(searchConfig)
        addEventListener('pageshow', () => search.reset(searchConfig))
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
