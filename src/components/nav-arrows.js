export function generate(certID) {
    const certNum = parseInt(certID),
          prevCert = certNum > 1 ? String(certNum - 1).padStart(10, '0') : null,
          nextCert = String(certNum + 1).padStart(10, '0')
    let navArrowsHTML = '<div class="nav-arrows">'
    if (prevCert)
        navArrowsHTML += `<a href="https://kudocoa.com/${prevCert}" class="nav-arrow left" title="Previous Certificate">&lt;</a>`
    else
        navArrowsHTML += '<span class="nav-arrow left disabled" title="No Previous Certificate">&lt;</span>'
    navArrowsHTML += `<a href="https://kudocoa.com/${nextCert}" class="nav-arrow right" title="Next Certificate">&lt;</a>`
    navArrowsHTML += '</div>'
    return { navArrowsHTML, prevCert, nextCert }
}
