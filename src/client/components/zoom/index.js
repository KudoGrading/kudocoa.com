export function zoomImg({ imgURL, title = '' }) {
    const fadeOutDuration = 0.12

    // Init overlay
    const overlay = document.createElement('div')
    Object.assign(overlay.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        transition: `background-color ${fadeOutDuration}s ease-out`
    })

    // Init zoomed img
    const zoomedImg = new Image() ; zoomedImg.src = imgURL
    Object.assign(zoomedImg.style, {
        maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', opacity: 0, transform: 'scale(0.95) translateY(10px)',
        transition: 'opacity 0.65s cubic-bezier(.165,.84,.44,1), transform 0.55s cubic-bezier(.165,.84,.44,1)'
    })
    if (title) zoomedImg.title = title

    // Add click listeners
    overlay.onclick = zoomedImg.onclick = closeModal
    function closeModal() {
        document.body.style.overflow = ''
        document.removeEventListener('wheel', preventScroll)
        document.removeEventListener('touchmove', preventScroll)
        overlay.style.backgroundColor = 'rgba(0,0,0,0)'
        Object.assign(zoomedImg.style, {
            opacity: 0, transform: 'scale(1.05)',
            transition: `opacity ${fadeOutDuration}s ease-out, transform ${fadeOutDuration}s ease-out`
        })
        setTimeout(() => overlay.parentNode && document.body.removeChild(overlay), fadeOutDuration *1000)
    }

    // Prevent scroll
    document.body.style.overflow = 'hidden'
    document.addEventListener('wheel', preventScroll, { passive: false })
    document.addEventListener('touchmove', preventScroll, { passive: false })
    function preventScroll(event) { event.preventDefault() }

    // Show modal
    overlay.append(zoomedImg) ; document.body.append(overlay)
    setTimeout(() => {
        overlay.style.backgroundColor = 'rgba(0,0,0,0.9)'
        zoomedImg.style.opacity = '1'
        zoomedImg.style.transform = 'scale(1) translateY(0)'
    }, 10)
}
