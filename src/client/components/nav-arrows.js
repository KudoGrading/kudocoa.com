export function createAppend() {
    const certID = /^\d{10}$/.exec(location.pathname.slice(1))?.[0] ; if (!certID) return
    const certNum = parseInt(certID)
    const prevCertNum = certNum > 1 ? String(certNum -1).padStart(10, '0') : null
    const nextCertNum = String(certNum +1).padStart(10, '0')
    const urlSuffix = location.search.includes('debug') ? '?debug' : ''
    const navArrowsHTML = `
        <div class="nav-arrows">
            ${ prevCertNum ?
                `<a href="/${ prevCertNum + urlSuffix }"
                    class="nav-arrow left" title="Previous Certificate">&lt;</a>`
              : '<span class="nav-arrow left disabled" title="No Previous Certificate">&lt;</span>'
            }
            <a href="/${ nextCertNum + urlSuffix }" class="nav-arrow right" title="Next Certificate">&lt;</a>
        </div>
    `
    document.body.insertAdjacentHTML('beforeend', navArrowsHTML)
    document.addEventListener('keydown', ({ key }) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
        if (key == 'ArrowLeft' && prevCertNum) location.href = `/${ prevCertNum + urlSuffix }`
        else if (key == 'ArrowRight') location.href = `/${ nextCertNum + urlSuffix }`
    })
}
