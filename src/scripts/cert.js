import * as navArrows from '../components/nav-arrows.js'

const app = await import('../../data/app.json')

export function generate(certID) {
    const { navArrowsHTML, prevCertNum, nextCertNum } = navArrows.generate(certID)
    return `
        document.addEventListener('DOMContentLoaded', () => {

            // Init SEARCH bar
            const input = document.getElementById('certNum'),
                  button = document.getElementById('verifyBtn')
            button.onclick = verify
            input.addEventListener('keydown', ({ key }) => key == 'Enter' && verify())
            function verify() {
                const certNum = input.value.trim()
                if (!certNum)
                    return alert('Please enter a certificate number')
                if (!/^\\d+$/.test(certNum))
                    return alert('Certificate number must contain only digits')
                button.disabled = true ; button.textContent = 'Retrieving...'
                location.href = '${app.urls.home}/' + certNum
            }
            const val = input.value ; input.value = '' ; input.value = val ; input.blur()
            addEventListener('pageshow', () => { // reset loading state
                button.disabled = false ; button.textContent = 'Verify Certificate'
                const val = input.value ; input.value = '' ; input.value = val ; input.blur()
            })

            // Add NAV arrows
            document.body.insertAdjacentHTML('beforeend', \`${navArrowsHTML.replace(/'/g, `\\'`)}\`)
            document.addEventListener('keydown', ({ key }) => {
                if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return
                ${ prevCertNum ? `if (key == 'ArrowLeft') location.href = '${app.urls.home}/${prevCertNum}'` : '' }
                if (key == 'ArrowRight') location.href = '${app.urls.home}/${nextCertNum}'
            })

            // Init DOWNLOAD buttons
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.addEventListener('click', async ({ currentTarget }) => {
                    event.preventDefault()
                    const url = currentTarget.getAttribute('data-url'),
                          filename = currentTarget.getAttribute('data-filename')
                    try {
                        const downloadURL = URL.createObjectURL(await (await fetch(url)).blob()),
                              a = document.createElement('a')
                        a.style.display = 'none' ; a.href = downloadURL ; a.download = filename
                        document.body.append(a) ; a.click()
                        URL.revokeObjectURL(downloadURL) ; document.body.removeChild(a)
                    } catch (err) { open(url, '_blank') }
                })
            })

            // Render ITEM SHOT
            const certImageDiv = document.getElementById('certImage')
            if (certImageDiv) {
                const placeholder = certImageDiv.querySelector('.img-placeholder'),
                      formats = ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                      certID = '${certID}'
                let currentFormat = 0
                tryNextFormat()
                function tryNextFormat() {
                    if (currentFormat >= formats.length) return placeholder.innerHTML = 'No image available'                
                    const format = formats[currentFormat],
                          imgURL = \`https://cdn.jsdelivr.net/gh/KudoGrading/certificates/coas/\${certID}/item.\${format}\`,                
                          img = new Image()
                    img.onload = () => {
                        certImageDiv.innerHTML = ''
                        const img = document.createElement('img') ; img.src = imgURL ; img.alt = 'Certificate Image'                    
                        img.onclick = () => zoomImg({ imgURL, title: 'Item Image' })                
                        certImageDiv.append(img)
                        setTimeout(() => trackMouseZoom(img), 0)
                    }
                    img.onerror = () => { currentFormat++ ; tryNextFormat() }                
                    img.src = imgURL
                }
            }

            // Render COA SHOT
            document.querySelector('.coa-img')?.addEventListener('click', function() {
                const imgURL = 'https://cdn.jsdelivr.net/gh/KudoGrading/certificates/coas/${certID}/certificate.png'
                zoomImg({ imgURL, title: 'Certificate' })
            })

            // Add BACK-TO-TOP button/link
            const bttBtn = document.createElement('div')
            bttBtn.className = 'back-to-top' ; bttBtn.title = 'Back to top' ; bttBtn.innerHTML = '<span>^</span>'
            bttBtn.onclick = () => {
                scrollTo({ top: 0, behavior: 'smooth' })
                bttBtn.classList.add('at-top')
                setTimeout(() => bttBtn.classList.remove('at-top'), 1000)
            }
            document.body.append(bttBtn)
            addEventListener('scroll', () => {
                if (scrollY > 300) { bttBtn.classList.add('visible') ; bttBtn.classList.remove('at-top') }
                else bttBtn.classList.remove('visible')
            })
            if (scrollY > 300) bttBtn.classList.add('visible') // in case already scrolled on load
            if (document.querySelector('.comic-pages')) // add back-to-top link to footer
                document.querySelector('.footer-links').innerHTML += 
                    '<span class="footer-separator"></span><a onclick="scrollTo({top:0,behavior:\\'smooth\\'});return false">Back to Top ↑</a>'
        })

        // FUNCTIONS

        function trackMouseZoom(img) {
            setTimeout(() => {
                if (!img.parentElement) return
                if (!img.parentElement.classList.contains('zoom-container')) {
                    const container = document.createElement('div') ; container.className = 'zoom-container'
                    img.style.cssText = \`
                        border:none ; padding:0 ; box-shadow:none ; max-width:100% ; max-height:600px ;
                        width:auto ; height:auto ; display:block ; object-fit:contain ; background:#000
                    \`          
                    container.style.cssText = \`
                        overflow:hidden ; position:relative ; display:inline-block ; line-height:0 ;
                        border:3px solid #fff ; padding:10px ; box-shadow:0 0 20px rgba(255,255,255,0.1) ;
                        background:#000
                    \`
                    img.parentNode.insertBefore(container, img) ; container.append(img)
                }
                const container = img.parentElement, scale = 1.5
                container.addEventListener('mousemove', event => {
                    event.preventDefault()
                    const rect = container.getBoundingClientRect(),
                          x = ((event.clientX - rect.left) / rect.width) *100,
                          y = ((event.clientY - rect.top) / rect.height) *100
                    img.style.transform = \`scale(\${scale})\`
                    img.style.transformOrigin = \`\${x}% \${y}%\`
                    img.style.transition = 'transform 0.05s ease-out'
                })
                container.addEventListener('mouseleave', () => {
                    img.style.transform = 'scale(1)'
                    img.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1.1)'
                })
            }, 0)
        }

        function zoomImg({ imgURL, title = '' }) {
            const fadeOutDuration = 0.12,
                  overlay = document.createElement('div')
            Object.assign(overlay.style, {
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                transition: \`background-color \${fadeOutDuration}s ease-out\`
            })
            const zoomedImg = new Image() ; zoomedImg.src = imgURL
            Object.assign(zoomedImg.style, {
                maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', opacity: 0,
                transform: 'scale(0.95) translateY(10px)',
                transition: 'opacity 0.65s cubic-bezier(.165,.84,.44,1), transform 0.55s cubic-bezier(.165,.84,.44,1)'
            })
            if (title) zoomedImg.title = title
            function closeModal() {
                document.body.style.overflow = ''
                document.removeEventListener('wheel', preventScroll)
                document.removeEventListener('touchmove', preventScroll)
                overlay.style.backgroundColor = 'rgba(0,0,0,0)'
                Object.assign(zoomedImg.style, {
                    opacity: 0, transform: 'scale(1.05)',
                    transition: \`opacity \${fadeOutDuration}s ease-out, transform \${fadeOutDuration}s ease-out\`
                })
                setTimeout(() => overlay.parentNode && document.body.removeChild(overlay), fadeOutDuration *1000)
            }
            overlay.onclick = zoomedImg.onclick = closeModal
            document.body.style.overflow = 'hidden'
            function preventScroll(event) { event.preventDefault() }
            document.addEventListener('wheel', preventScroll, { passive: false })
            document.addEventListener('touchmove', preventScroll, { passive: false })
            overlay.append(zoomedImg) ; document.body.append(overlay)
            setTimeout(() => {
                overlay.style.backgroundColor = 'rgba(0,0,0,0.9)'
                zoomedImg.style.opacity = '1'
                zoomedImg.style.transform = 'scale(1) translateY(0)'
            }, 10)
        }
    `
}
