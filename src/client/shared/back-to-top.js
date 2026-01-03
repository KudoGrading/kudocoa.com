export function initBackToTop() {
    const bttBtn = document.createElement('div')
    bttBtn.className = 'back-to-top' ; bttBtn.title = 'Back to top' ; bttBtn.innerHTML = '<span>^</span>'
    bttBtn.onclick = () => {
        scrollTo({ top: 0, behavior: 'smooth' })
        bttBtn.classList.add('at-top')
        setTimeout(() => bttBtn.classList.remove('at-top'), 1000)
    }
    document.body.append(bttBtn)
    addEventListener('scroll', () => {
        if (window.scrollY > 300) { bttBtn.classList.add('visible') ; bttBtn.classList.remove('at-top') }
        else bttBtn.classList.remove('visible')
    })
    if (document.querySelector('.comic-pages')) // add back-to-top footer link
        document.querySelector('.footer-links').innerHTML +=
            '<span class="footer-separator"></span><a onclick="window.scrollTo({top:0,behavior:\'smooth\'});return false">Back to Top ↑</a>'
}
