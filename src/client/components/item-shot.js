export function initItemShot(certID, baseURLs) {
    const certImgDiv = document.getElementById('certImg') ; if (!certImgDiv) return
    const itemPlaceholder = certImgDiv.querySelector('.item-placeholder')
    const formats = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    let currentFormat = 0
    tryNextFormat()
    function tryNextFormat() {
        if (currentFormat >= formats.length) return itemPlaceholder.innerHTML = 'No image available'
        const format = formats[currentFormat],
              imgURL = `${baseURLs.jsdelivr}/certificates/coas/${certID}/item.${format}`,
              img = new Image()
        img.onload = () => {
            certImgDiv.innerHTML = ''
            const newImg = document.createElement('img') ; newImg.src = imgURL ; newImg.alt = 'Certificate Image'
            import('./zoom/index.js').then(({ zoomImg }) => {
                newImg.onclick = () => zoomImg({ imgURL, title: 'Item Image' })})
            certImgDiv.append(newImg)
            import('./zoom/mouse.js').then(({ trackMouseZoom }) => setTimeout(() => trackMouseZoom(newImg), 0))
        }
        img.onerror = () => { currentFormat++ ; tryNextFormat() }
        img.src = imgURL
    }
}
