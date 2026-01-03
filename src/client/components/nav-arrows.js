export function initNavArrows(navArrowsHTML, prevCertNum, nextCertNum, baseURL) {
    document.body.insertAdjacentHTML('beforeend', navArrowsHTML)
    document.addEventListener('keydown', ({ key }) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return
        if (key == 'ArrowLeft' && prevCertNum) location.href = `${baseURL}/${prevCertNum}`
        else if (key == 'ArrowRight') location.href = `${baseURL}/${nextCertNum}`
    })
}
