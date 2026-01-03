export function trackMouseZoom(img) {
    setTimeout(() => {
        if (!img.parentElement) return
        if (!img.parentElement.classList.contains('zoom-container')) {
            const container = document.createElement('div')
            container.className = 'zoom-container'
            img.style.cssText = `
                border: none ; padding: 0 ; box-shadow: none ; max-width: 100% ; max-height: 600px ; width: auto ;
                height: auto ; display: block ; object-fit: contain ; background: #000 ;
            `
            container.style.cssText = `
                overflow: hidden ; position: relative ; display: inline-block ; line-height: 0 ;
                border: 3px solid #fff ; padding: 10px ; box-shadow: 0 0 20px rgba(255,255,255,0.1) ;
                background: #000 ;
            `
            img.parentNode.insertBefore(container, img) ; container.append(img)
        }
        const container = img.parentElement, scale = 1.5
        container.addEventListener('mousemove', event => {
            event.preventDefault()
            const rect = container.getBoundingClientRect(),
                  x = ((event.clientX - rect.left) / rect.width) * 100,
                  y = ((event.clientY - rect.top) / rect.height) * 100
            Object.assign(img.style, {
                transform: `scale(${scale})`, transformOrigin: `${x}% ${y}%`, transition: 'transform 0.05s ease-out' })
        })
        container.addEventListener('mouseleave', () =>
            Object.assign(img.style, {
                transform: 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1.1)' })
        )
    }, 0)
}
