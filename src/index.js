import * as string from './lib/string.js'
import css from './styles/global.css'

export default {
    async fetch(req, env) {
        const url = new URL(req.url)

        // Render homepage or 404 for non-kudocoa.com req's
        if (/^\/?$/.test(url.pathname)) { // homepage
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Kudo Grading + Authentication</title>
                        <meta name="description" content="Verify certificate authenticity with Kudo Grading & Authentication Services">
                        <style>${css}</style>
                        <link rel="icon" type="image/x-icon" href="https://kudoai.com/assets/images/icons/kudoai/favicon.ico">
                    </head>
                    <body class="homepage">
                        <div class="container">
                            ${generateHeader('')}
                            ${generateFooter()}
                        </div>
                        <script>${generateBaseScript()}</script>
                    </body>
                </html>`
            return new Response(minify(html), { headers: { 'Content-Type': 'text/html' }})
        }

        // Validate cert #
        const certInput = url.pathname.split('/')[1]
        if (!/^\d+$/.test(certInput))
            return new Response('Invalid certificate ID (numbers only)', { status: 400 })
        const certID = certInput.padStart(10, '0')
        if (certID.length > 10)
            return new Response('Certificate ID too long (max 10 digits)', { status: 400 })
        if (certInput != certID) // redir e.g. /1 to /0000000001
            return Response.redirect('https://kudocoa.com/' + certID, 301)

        // Render cert page
        try {
            const certDataRaw = await env.COAS_KV.get(certID)
            if (!certDataRaw) {
                const errorContent = `
<div class="error-message">Certificate # <strong>${certID}</strong> not found.</div>`
                const html = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${generatePageTitle(certID, {})}</title>
        <meta name="description" content="Certificate # ${certID} not found">
        <style>${css}</style>
        <link rel="icon" type="image/x-icon" href="https://kudoai.com/assets/images/icons/kudoai/favicon.ico">
    </head>
    <body>
        <div class="container">
            ${generateHeader(certID)}
            ${errorContent}
            ${generateFooter()}
        </div>
        <script>${generateCertScript(certID)}</script>
    </body>
</html>`
                return new Response(minify(html), { headers: { 'Content-Type': 'text/html' }, status: 404  })
            }
            const certData = JSON.parse(certDataRaw),
                  content = await generateCertContent(certID, certData),
                  html = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${generatePageTitle(certID, certData)}</title>
        <meta name="description" content="Certificate # ${certID} verified by Kudo Grading & Authentication Services">
        <style>${css}</style>
        <link rel="icon" type="image/x-icon" href="https://kudoai.com/assets/images/icons/kudoai/favicon.ico">
    </head>
    <body>
        <div class="container">
            ${generateHeader(certID)}
            ${content}
            ${generateFooter()}
        </div>
        
        <script>${generateCertScript(certID)}</script>
    </body>
</html>`
            return new Response(minify(html), {
                headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=300' }})

        } catch (err) { console.error('Error:', err) ; return new Response('System error', { status: 500 }) }
    }
}

// FUNCTIONS

function generateBaseScript() {
    return `document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNumber'),
              button = document.getElementById('verifyBtn')
        button.onclick = verify
        input.addEventListener('keydown', ({ key }) => key == 'Enter' && verify())
        function verify() {
            const certNumber = input.value.trim()
            if (!certNumber)
                return alert('Please enter a certificate number')
            if (!/^\\d+$/.test(certNumber))
                return alert('Certificate number must contain only digits')
            button.disabled = true ; button.textContent = 'Retrieving...'
            location.href = 'https://kudocoa.com/' + certNumber
        }
        input.focus() ; const val = input.value ; input.value = '' ; input.value = val
        addEventListener('pageshow', () => {
            button.disabled = false ; button.textContent = 'Verify Certificate'
            input.focus() ; const val = input.value ; input.value = '' ; input.value = val
        })
    })`
}

async function generateCertContent(certID, certData) {
    function generateDetailRows() {
        const rows = [];
        for (const [key, val] of Object.entries(certData)) {
            if (/(?:Notes|interiorURL)$/i.test(key)) continue

            const label = string.camelToTitleCase(key)
            let displayVal = /date/i.test(key) ? string.formatDate(val) : val.toString().toUpperCase()

            if (/By$/i.test(key)) {
                displayVal = displayVal.replace(/[,&]/g, ' +')
                if (/(?:authenticated|graded)by$/i.test(key)) {
                    const imgName = val.toString().toLowerCase()
                        .replace(/[&,+]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                    const imgURL = `https://cdn.jsdelivr.net/gh/KudoGrading/certificates/assets/images/signatures/${imgName}/white.png`
                    displayVal = generateImgOrText(imgURL, displayVal)
                }
            }

            if (/^publisher$/i.test(key)) {
                const publisherSlug = val.toString().toLowerCase()
                    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                const logoUrl = `https://cdn.jsdelivr.net/gh/KudoComics/assets/images/logos/publishers/${publisherSlug}/white.png`;
                displayVal = generateImgOrText(logoUrl, displayVal);
            }

            if (/^coa/i.test(key) && /certificate/i.test(displayVal)) {
                displayVal = `
                    <div class="cert-type-with-icon">
                        <div class="certificate-image-container">
                            <img src="https://cdn.jsdelivr.net/gh/KudoGrading/certificates/coas/${certID}/certificate.png" 
                                alt="Certificate Image" 
                                class="certificate-image"
                                onerror="this.style.display='none'">
                        </div>
                        <div class="cert-type-text">${displayVal}</div>
                    </div>
                `;
            }

            rows.push(`
                <div class="detail-row">
                    <div class="detail-label">${label}:</div>
                    <div class="detail-value">${displayVal}</div>
                </div>
            `);
        }

        return rows.join('');
    }

    // Generate comic pages if they exist
    const comicPagesHTML = await generateComicPages(certData)
    return `
        <div class="cert-header">
            <div class="serial-num">CERT. NUMBER: ${certID}</div>
            <div class="header-right">
                <div class="download-section">
                    <div class="download-label">Download:</div>
                    <div class="download-buttons">
                        <button class="download-btn" data-filename="kudo_coa_${certID}.png"
                                data-url="https://cdn.jsdelivr.net/gh/KudoGrading/certificates/coas/${certID}/certificate.png">
                            PNG</button>
                        <button class="download-btn" data-filename="kudo_coa_${certID}.pdf"
                                data-url="https://cdn.jsdelivr.net/gh/KudoGrading/certificates/coas/${certID}/certificate.pdf">
                            PDF</button>
                    </div>
                </div>
                ${generateVerificationBadge(certData)}
            </div>
        </div>
        
        <div class="cert-body">
            <div class="cert-image" id="certImage"><div class="image-placeholder">Loading image...</div></div>
            <div class="cert-details">${generateDetailRows()}</div>
        </div>

        ${generateNotesSection(certData)}
        ${comicPagesHTML}
    `;
}

function generateCertScript(certID) {
    const { navArrowsHTML, prevCert, nextCert } = generateNav(certID)
    return `
        document.addEventListener('DOMContentLoaded', () => {

            // Init SEARCH bar
            const input = document.getElementById('certNumber'),
                  button = document.getElementById('verifyBtn')
            button.onclick = verify
            input.addEventListener('keydown', ({ key }) => key == 'Enter' && verify())
            function verify() {
                const certNumber = input.value.trim()
                if (!certNumber)
                    return alert('Please enter a certificate number')
                if (!/^\\d+$/.test(certNumber))
                    return alert('Certificate number must contain only digits')
                button.disabled = true ; button.textContent = 'Retrieving...'
                location.href = 'https://kudocoa.com/' + certNumber
            }
            input.focus() ; const val = input.value ; input.value = '' ; input.value = val
            addEventListener('pageshow', () => { // reset loading state
                button.disabled = false ; button.textContent = 'Verify Certificate'
                input.focus() ; const val = input.value ; input.value = '' ; input.value = val
            })

            // Add NAV arrows
            document.body.insertAdjacentHTML('beforeend', '${navArrowsHTML.replace(/'/g, `\\'`)}')
            document.addEventListener('keydown', ({ key }) => {
                ${ prevCert ? `if (key == 'ArrowLeft') location.href = 'https://kudocoa.com/${prevCert}'` : '' }
                if (key == 'ArrowRight') location.href = 'https://kudocoa.com/${nextCert}'
            })

            // Init DOWNLOAD buttons
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.addEventListener('click', async ({ currentTarget }) => {
                    event.preventDefault()
                    const url = currentTarget.getAttribute('data-url'),
                          filename = currentTarget.getAttribute('data-filename')
                    try {
                        const response = await fetch(url),
                              blob = await response.blob(),
                              downloadURL = window.URL.createObjectURL(blob),
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
                const placeholder = certImageDiv.querySelector('.image-placeholder'),
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
                        img.onclick = () => zoomImg(imgURL, 'Item Image')                
                        certImageDiv.append(img)
                        setTimeout(() => trackMouseZoom(img), 0)
                    }
                    img.onerror = () => { currentFormat++ ; tryNextFormat() }                
                    img.src = imgURL
                }
            }

            // Render COA SHOT
            document.querySelector('.certificate-image')?.addEventListener('click', function() {
                const certImgURL = 'https://cdn.jsdelivr.net/gh/KudoGrading/certificates/coas/${certID}/certificate.png'
                zoomImg(certImgURL, 'Certificate')
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
                    '<span class="footer-separator"></span><a onclick="window.scrollTo({top:0,behavior:\\'smooth\\'});return false">Back to Top ↑</a>'
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

        function zoomImg(imgURL, title = '') {
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
    }`
}

async function generateComicPages(certData) {
    const { interiorURL } = certData
    if (!interiorURL || !interiorURL.includes('readallcomics.com')) return ''

    try {
        const pagesHTML = await (await fetch(interiorURL)).text()
        const imgPattern = /<img[^>]+src="([^"]+)"[^>]*>/gi
        const matches = []
        let match

        // Collect ALL image URLs
        while ((match = imgPattern.exec(pagesHTML)) != null) {
            matches.push(match[1])
        }

        if (!matches.length) return ''

        // Find most common domain (using last 2 segments to handle subdomains)
        const domainCounts = {}
        matches.forEach(src => {
            try {
                const url = new URL(src)
                const hostname = url.hostname
                // Extract domain without subdomain (last 2 segments)
                const parts = hostname.split('.')
                const domain = parts.length >= 2
                    ? parts.slice(-2).join('.')  // Get last 2 parts like "blogspot.com"
                    : hostname
                domainCounts[domain] = (domainCounts[domain] || 0) + 1
            } catch {}
        })

        // Get domain with most images
        let mostCommonDomain = ''
        let maxCount = 0
        for (const [domain, count] of Object.entries(domainCounts)) {
            if (count > maxCount) {
                maxCount = count
                mostCommonDomain = domain
            }
        }

        console.log('Most common domain:', mostCommonDomain, 'count:', maxCount)

        // Filter images from the most common domain (check if ends with the domain)
        const comicImages = matches.filter(src => {
            try {
                const url = new URL(src)
                const hostname = url.hostname
                const domainParts = hostname.split('.')
                const domain = domainParts.length >= 2
                    ? domainParts.slice(-2).join('.')
                    : hostname
                return domain == mostCommonDomain &&
                       !src.includes('/avatar-') &&
                       !src.includes('logo-') &&
                       !src.includes('icon.')
            } catch { return false }
        })

        // Skip first image (cover)
        const interiorPages = comicImages.slice(1)
        console.log('Found', interiorPages.length, 'interior pages')
        return !interiorPages.length ? '' : `
            <div class="comic-pages">
                <div class="comic-title">INTERIOR PAGES (OF REFERENCE COPY)</div>
                ${interiorPages.map((src, idx) => `
                    <div class="comic-page">
                        <img src="${src}" loading="lazy">
                        <div class="page-number">PAGE ${ idx +1 }</div>
                    </div>
                `).join('')}
            </div>
        `
    } catch (err) { console.error('Error fetching comic pages:', err) ; return '' }
}

function generateFooter() {
    return `
        <footer>
            <div>© ${new Date().getFullYear()} KUDO GRADING & AUTHENTICATION SERVICES</div>
            <div class="footer-links">
                <a href="https://www.kudocoa.com">Home</a>
                <span class="footer-separator"></span>
                <a href="https://github.com/KudoGrading" target="_blank" rel="noopener">GitHub</a>
                <span class="footer-separator"></span>
                <a href="mailto:support@kudocoa.com">Contact</a>
            </div>
        </footer>
    `;
}

function generateHeader(certID = '') {
    return `
        <div class="hero">
            <div class="hero-big">KUDO</div>
            <div class="hero-small">GRADING + AUTHENTICATION</div>
        </div>
        
        <div class="search-bar">
            <input type="number" id="certNumber" placeholder="Enter certificate number" autofocus value="${certID}">
            <button class="search-btn" id="verifyBtn">Verify Certificate</button>
        </div>
    `;
}

function generateImgOrText(imgURL, displayText) {
    const id = 'img_' + Date.now() + Math.random().toString(36).substr(2, 9);
    return `
        <div style="margin: -15px 0 -11px">
            <span class="name-text" id="name_${id}">${displayText}</span>
            <img src="${imgURL}" 
                 alt="${displayText}" 
                 class="dynamic-image"
                 id="img_${id}"
                 onload="document.getElementById('img_${id}').style.display='block'; document.getElementById('name_${id}').style.display='none'"
                 onerror="this.style.display='none'"
                 style="display:none">
        </div>
    `;
}

function generateNav(certID) {
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

function generateNotesSection(certData) {
    const notes = []
    for (const [key, val] of Object.entries(certData)) {
        if (!/Notes$/i.test(key) || !val) continue
        let adj = string.camelToTitleCase(key.replace(/Notes$/i, ''))
        if (adj.endsWith('s')) adj = adj.slice(0, -1) + `'s`
        notes.push({ label: `${adj} Notes`, content: val })
    }
    return !notes.length ? '' : notes.map(note => `
        <div class="notes-section">
            <div class="notes-label">${note.label}</div>
            <div class="notes-content">${note.content}</div>
        </div>
    `).join('')
}

function generatePageTitle(certID, certData) {
    const yearMatch = (certData?.coverDate || certData?.publishDate)?.match(/\d{4}/),
          year = yearMatch ? ` (${yearMatch[0]})` : ''
    return `Kudo COA #${parseInt(certID)} / ${certData?.item || ''}${year} / Kudo Grading + Authentication`
}

function generateVerificationBadge(certData) {
    const cnts = { art: 0, sig: 0 }

    for (const [key, val] of Object.entries(certData)) {
        const label = key.toLowerCase()
        let valStr = val.toString().toLowerCase()

        if (/artwork|painted/i.test(label)) {
            cnts.art++ ; valStr = valStr.replace(/&/g, '+')
            cnts.comma = (valStr.match(/,/g) || []).length
            cnts.plus = (valStr.match(/\+/g) || []).length
            cnts.art += cnts.comma + cnts.plus
        }

        if (/signed|signature|sign/.test(label)) {
            cnts.sig++
            valStr = valStr.replace(/&/g, '+')
            cnts.comma = (valStr.match(/,/g) || []).length
            cnts.plus = (valStr.match(/\+/g) || []).length
            cnts.sig += cnts.comma + cnts.plus
        }
    }

    let badgeText = '' ; let totalChecks = 0
    if (cnts.art > 0 && cnts.sig > 0) {
        totalChecks = cnts.art + cnts.sig
        const sigText = cnts.sig == 1 ? 'SIGNATURE' : cnts.sig + 'X SIGNATURES'
        badgeText = 'ARTWORK + ' + sigText + ' VERIFIED'
    } else if (cnts.art > 0) {
        totalChecks = cnts.art
        badgeText = 'ARTWORK VERIFIED'
    } else if (cnts.sig > 0) {
        totalChecks = cnts.sig
        badgeText = cnts.sig == 1 ? 'SIGNATURE VERIFIED' : cnts.sig + 'X SIGNATURES VERIFIED';
    } else {
        totalChecks = 1
        badgeText = 'VERIFIED'
    }

    const checkmarks = '✓'.repeat(Math.min(totalChecks, 10))
    return `
        <div class="status-badge">
            <span class="checkmarks">${checkmarks}</span>
            <span class="status-text">${badgeText}</span>
        </div>`
}

function minify(html) {

    // Extract scripts to preserve from minification
    const scriptsToPreserve = [], scriptRegex = /<script\b[^>]*>[\s\S]+?<\/script>/gi
    let match
    while ((match = scriptRegex.exec(html)) != null) scriptsToPreserve.push(match[0])

    // Temp replace scripts w/ placeholders
    let tempHTML = html
    scriptsToPreserve.forEach((script, idx) =>
        tempHTML = tempHTML.replace(script, `<!-- SCRIPT_PLACEHOLDER_${idx} -->`))

    // Minify remaining HTML
    const minifiedHTML = tempHTML
        .replace(/\s+/g, ' ') // replace multi-spaces w/ single space
        .replace(/>\s+</g, '><') // remove spaces between tags
        .trim() // trim leading/trailing whitespace

    // Restore scripts
    let finalHTML = minifiedHTML
    scriptsToPreserve.forEach((script, idx) =>
        finalHTML = finalHTML.replace(`<!-- SCRIPT_PLACEHOLDER_${idx} -->`, script))

    return finalHTML
}
