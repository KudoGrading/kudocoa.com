const site = await import('../../data/app.json')

export function generate(certID) {
    const certNum = parseInt(certID)
    const prevCertNum = certNum > 1 ? String(certNum -1).padStart(10, '0') : null
    const nextCertNum = String(certNum +1).padStart(10, '0')
    const navArrowsHTML = `
        <div class="nav-arrows">
            ${ prevCertNum ?
                `<a href="${app.urls.home}/${prevCertNum}"
                    class="nav-arrow left" title="Previous Certificate">&lt;</a>`
              : '<span class="nav-arrow left disabled" title="No Previous Certificate">&lt;</span>'
            }
            <a href="${app.urls.home}/${nextCertNum}" class="nav-arrow right" title="Next Certificate">&lt;</a>
        </div>
    `
    return { navArrowsHTML, prevCertNum, nextCertNum }
}
