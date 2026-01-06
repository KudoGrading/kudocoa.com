export async function initBackToTop() {
    const app = await (await fetch('/assets/data/app.json')).json()
    if (!window.dom) await import(`${app.urls.assetHost.aiweb}/js/lib/dom.js/dist/dom.min.js`)

    // Add back-to-top corner button
    const bttBtn = dom.create.elem('div', {
        className: 'btt-btn', title: 'Back to top', innerHTML: '<span>^</span>',
        onclick: () => {
            scrollToTop() ; bttBtn.classList.add('at-top') ; setTimeout(() => bttBtn.classList.remove('at-top'), 1000) }
     })
    document.body.append(bttBtn)
    addEventListener('scroll', () => {
        if (window.scrollY > 300) { bttBtn.classList.add('visible') ; bttBtn.classList.remove('at-top') }
        else bttBtn.classList.remove('visible')
    })

    if (document.querySelector('.comic-pages')) // add back-to-top footer link
        document.querySelector('.footer-links')?.append(
            dom.create.elem('span', { className: 'footer-separator' }),
            dom.create.elem('a', { textContent: 'Back to Top ↑', onclick: scrollToTop })
        )

    function scrollToTop({ duration = 500 /* ms */ } = {}) {
        const startY = pageYOffset ; let startTime
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
