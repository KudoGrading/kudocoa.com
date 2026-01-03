export function initNavArrows(navArrowsHTML, prevCertNum, nextCertNum, baseUrl) {
    document.body.insertAdjacentHTML('beforeend', navArrowsHTML)
    document.addEventListener('keydown', ({ key }) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return
        if (key == 'ArrowLeft' && prevCertNum) location.href = `${baseUrl}/${prevCertNum}`
        else if (key == 'ArrowRight') location.href = `${baseUrl}/${nextCertNum}`
    })
}
