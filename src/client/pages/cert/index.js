
import { initDownloadBtns } from './download-btns.js'
import { initItemShot } from './item-shot.js'
import { zoomImg } from './zoom.js'
import { initBackToTop } from '../../components/back-to-top.js'
import * as navArrows from '../../components/nav-arrows.js'
import * as search from '../../components/search.js'

export function initCertPage(config) {
    document.addEventListener('DOMContentLoaded', async () => {
        const app = await (await fetch('/assets/data/app.json')).json()
        search.init({ input: document.querySelector('.search-bar input'), focus: false })
        navArrows.createAppend()
        initDownloadBtns()
        initItemShot()
        document.querySelector('.coa-img')?.addEventListener('click', () => zoomImg({
            title: 'Certificate',
            imgURL: `${app.urls.assetHost.cert}/coas/${config.certID}/certificate.png`
        }))
        initBackToTop()
    })
}
