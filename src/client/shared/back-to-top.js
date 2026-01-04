export function initBackToTop() {
    const bttBtn = document.createElement('div')
    bttBtn.className = 'back-to-top' ; bttBtn.title = 'Back to top' ; bttBtn.innerHTML = '<span>^</span>'
    bttBtn.onclick = () => {
        scrollToTop() ; bttBtn.classList.add('at-top') ; setTimeout(() => bttBtn.classList.remove('at-top'), 1000) }
    document.body.append(bttBtn)
    addEventListener('scroll', () => {
        if (window.scrollY > 300) { bttBtn.classList.add('visible') ; bttBtn.classList.remove('at-top') }
        else bttBtn.classList.remove('visible')
    })
    if (document.querySelector('.comic-pages, .vid-embed')) { // add back-to-top footer link
        const footerLinks = document.querySelector('.footer-links')
        const separator = document.createElement('span') ; separator.className = 'footer-separator'
        const bttLink = document.createElement('a') ; bttLink.textContent = 'Back to Top ↑'
        bttLink.onclick = event => { event.preventDefault() ; scrollToTop() }
        footerLinks.append(separator) ; footerLinks.append(bttLink)
    }
    function scrollToTop() {
        const duration = 500, startY = pageYOffset ; let startTime
        requestAnimationFrame(scrollStep)
        function scrollStep(timestamp) {
            startTime ||= timestamp
            const elapsed = timestamp - startTime,
                p = Math.min(elapsed / duration, 1), // progress 0-1
                ease = p < 0.5 ? 2*p*p : -1+(4-2*p)*p // faster in middle, slower at ends
            scrollTo(0, startY - startY * ease)
            if (elapsed < duration) requestAnimationFrame(scrollStep)
        }
    }
}
