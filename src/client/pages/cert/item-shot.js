import * as zoom from './zoom.js'

export async function initItemShot() {
    const certID = /^\d{10}$/.exec(location.pathname.slice(1))?.[0] ; if (!certID) return
    const app = await (await fetch('/assets/data/app.json')).json()
    if (!window.dom) await import(`${app.urls.assetHost.aiweb}/js/lib/dom.js/dist/dom.min.js`)
    const certImgDiv = document.querySelector('.item-shot') ; if (!certImgDiv) return
    const itemPlaceholder = certImgDiv.querySelector('.item-placeholder')
    const formats = ['jpg', 'png', 'jpeg', 'webp', 'gif']
    let currentFormat = 0 ; tryNextFormat()
    function tryNextFormat() {
        if (currentFormat >= formats.length) return itemPlaceholder.textContent = 'No image available'
        const img = new Image(), imgURL = `${app.urls.assetHost.cert}/coas/${certID}/item.${formats[currentFormat]}`
        img.onload = () => {
            certImgDiv.replaceChildren()
            const newImg = dom.create.elem('img', { src: imgURL, alt: 'Certificate Image',
                onclick: () => zoom.zoomImg({ imgURL, title: 'Item Image' })})
            certImgDiv.append(newImg) ; zoom.trackMouseZoom(newImg)
        }
        img.onerror = () => { currentFormat++ ; tryNextFormat() }
        img.src = imgURL
    }
}
