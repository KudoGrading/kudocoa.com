if (!window.dom) await import(
    'https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@1e84c2e/assets/js/lib/dom.js/dist/dom.min.js')

export function initItemShot({ certID, baseURLs }) {
    const certImgDiv = document.getElementById('certImg') ; if (!certImgDiv) return
    const itemPlaceholder = certImgDiv.querySelector('.item-placeholder')
    const formats = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    let currentFormat = 0 ; tryNextFormat()
    function tryNextFormat() {
        if (currentFormat >= formats.length) return itemPlaceholder.innerHTML = 'No image available'
        const format = formats[currentFormat],
              imgURL = `${baseURLs.jsdelivr}/certificates/coas/${certID}/item.${format}`,
              img = new Image()
        img.onload = () => {
            certImgDiv.innerHTML = ''
            const newImg = dom.create.elem('img', {
                src: imgURL, alt: 'Certificate Image',
                onclick: () => import('./zoom/index.js').then(({ zoomImg }) => zoomImg({ imgURL, title: 'Item Image' }))
            })
            certImgDiv.append(newImg)
            import('./zoom/mouse.js').then(({ trackMouseZoom }) => setTimeout(() => trackMouseZoom(newImg), 0))
        }
        img.onerror = () => { currentFormat++ ; tryNextFormat() }
        img.src = imgURL
    }
}
