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
        } else if (url.hostname != 'kudocoa.com')
            return new Response('Not found', { status: 404 })

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
        <script>${generateCertificateScript(certID)}</script>
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
        
        <script>${generateCertificateScript(certID)}</script>
    </body>
</html>`
            return new Response(minify(html), {
                headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=300' }})
            
        } catch (err) { console.error('Error:', err) ; return new Response('System error', { status: 500 }) }
    }
}

// FUNCTIONS

function camelToTitleCase(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/\bAnd\b/gi, '/')
}

function formatDate(dateStr) {
    if (!dateStr) return 'NOT SPECIFIED'
    try {
        if (/^\d{4}-\d{1,2}$/.test(dateStr)) {
            const [year, month] = dateStr.split('-').map(Number)
            const date = new Date(year, month - 1, 1)
            return date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long'
            }).toUpperCase()
        }
        
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric' 
        }).toUpperCase()
    } catch { 
        return dateStr.toUpperCase() 
    }
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

function generateNotesSection(certData) {
    const notesSections = [];
    
    for (const [key, value] of Object.entries(certData)) {
        if (/Notes$/i.test(key) && value) {
            let label = key.replace(/Notes$/i, '');
            
            if (label.toLowerCase() === 'authenticators') {
                label = "Authenticator's";
            } else if (label.toLowerCase() === 'graders') {
                label = "Grader's";
            } else {
                label = camelToTitleCase(label);
            }
            
            notesSections.push({
                label: `${label} Notes`,
                content: value
            });
        }
    }
    
    if (!notesSections.length) return ''
    
    return notesSections.map(note => `
        <div class="notes-section">
            <div class="notes-label">${note.label}</div>
            <div class="notes-content">${note.content}</div>
        </div>
    `).join('');
}

function generatePageTitle(certID, certData) {
    // Remove leading zeros and convert to number
    const certNum = parseInt(certID)
    let year = ''
    
    // Check for year in coverDate or publishDate
    if (certData?.coverDate) {
        const match = certData.coverDate.match(/\d{4}/)
        if (match) year = ` (${match[0]})`
    } else if (certData?.publishDate) {
        const match = certData.publishDate.match(/\d{4}/)
        if (match) year = ` (${match[0]})`
    }
    
    const itemPart = ` / ${certData?.item}${year}`
    return `Kudo COA #${certNum}${itemPart} / Kudo Grading + Authentication`
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

async function generateCertContent(certID, certData) {
    function generateDetailRows() {
        const rows = [];
        for (const [key, val] of Object.entries(certData)) {
            if (/(?:Notes|interiorURL)$/i.test(key)) continue
            
            const label = camelToTitleCase(key);
            let displayVal = /date/i.test(key) ? formatDate(val) : val.toString().toUpperCase();
                        
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

function generateCertificateScript(certID) {
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
            document.body.insertAdjacentHTML('beforeend', '${navArrowsHTML.replace(/'/g, "\\'")}')
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

function minify(html) {

    // Extract scripts to preserve from minification
    const scriptsToPreserve = [], scriptRegex = /<script\b[^>]*>([\s\S]+?)<\/script>/gi
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

const css = `
    * { margin:0 ; padding:0 ; box-sizing:border-box }
    html { overflow-y: scroll }
    body { background:#000 ; color:#fff ; min-height: 100vh ; padding: 20px ; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif }
    .container { max-width: 1400px ; margin: 0 auto ; padding-top: 50px }
    .homepage { transform: scale(0.8) }
    .homepage .container { height: 95vh ; padding: 0 }
    .homepage footer { border-top: none }
    .hero { text-align: center ; margin-bottom: 4rem }
    .homepage .hero { margin-bottom: 2rem } /* Less margin on homepage */
    .hero-big { font-family: sans-serif ; font-size: 15rem ; font-weight: 900 ; text-transform: uppercase ; letter-spacing:-0.03em ; line-height:0.9 }
    .homepage .hero-big { font-size: 22rem } /* Only homepage gets larger logo */
    .homepage .hero-small { font-size: 2.88rem } /* Only homepage gets larger logo */
    .hero-small { font-size: 1.88rem ; text-transform: uppercase ; letter-spacing:0.3em ; margin-top:1rem ; font-weight:400 }
    .search-bar { max-width:600px ; margin:0 auto 4rem }
    .homepage .search-bar { margin:4rem auto } /* Adjust search bar position on homepage */
    input, .search-btn { display:block ; width:100% ; border:3px solid #fff ; background:#000 ; color:#fff ; font-size:1.88rem ; padding:1.5rem ; margin-bottom:1rem ; text-align:center ; outline:none }
    input::placeholder { color:#888 ; font-size: 1.5rem }
    .search-btn { cursor:pointer ; font-weight:bold ; border-width:3px ; text-transform:uppercase }
    .search-btn:hover { background:#fff ; color:#000 }
    input::-webkit-inner-spin-button, input::-webkit-outer-spin-button { -webkit-appearance:none ; margin:0 }
    input { -moz-appearance:textfield ; appearance:textfield }
    .cert-header { display:flex ; justify-content:space-between ; align-items:center ; margin-bottom:3rem ; margin-top:100px ; border-bottom:2px solid #fff ; padding-bottom:1.5rem ; gap:2rem }
    .serial-num { font-size: 2.5rem ; font-weight: bold ; text-transform: uppercase ; letter-spacing:2px }
    .header-right { display:flex ; align-items:center ; gap:2rem }
    .download-section { display:flex ; align-items:center ; gap:1rem }
    .download-label { font-size:1.1rem ; text-transform:uppercase ; font-weight:bold ; display:flex ; align-items:center ; gap:0.3rem ; position:relative }
    .download-label::before { content: "↓" ; font-size:1.2rem ; position:relative ; left:-2px ; top: -2px }
    .download-buttons { display:flex ; gap:0.5rem }
    .download-btn { background:#000 ; color:#fff ; border:2px solid #fff ; padding:0.8rem 1.2rem ; text-transform:uppercase ; font-weight:bold ; cursor:pointer ; text-decoration:none ; font-size:1rem ; border-radius:60px }
    .download-btn:hover { background:#fff ; color:#000 }
    .status-badge { background:#fff ; color:#000 ; padding:0.8rem 2rem ; border-radius:30px ; font-weight:bold ; font-size:1.3rem ; text-transform:uppercase ; display:flex ; align-items:center ; gap:0.8rem ; white-space:nowrap }
    .checkmarks { font-size:1.88rem ; letter-spacing:-0.2em ; margin-right:0.2rem }
    .status-text { white-space:nowrap }
    .cert-body { display:flex ; gap:4rem ; margin-bottom:3rem ; flex-wrap:wrap }
    .cert-details, .cert-image { flex:1 ; min-width:300px }
    .cert-image { display:flex ; align-items:center ; justify-content:center }
    .cert-image img { 
        max-width:100% ; max-height:600px ; border:3px solid #fff ; padding:10px ; 
        box-shadow:0 0 20px rgba(255,255,255,0.1) ; display:block ; cursor:crosshair ; 
        transition:transform 0.3s ease ; object-fit:contain ; background:#000 ;
        box-sizing:content-box ; /* border/padding outside image dims */
    }
    .zoom-container { display:inline-block ; line-height:0 ; background:#000 }
    .zoom-container img { margin:0 }
    .cert-image img:hover { transform: scale(1.5) }
    .cert-type-with-icon { display:flex ; flex-direction:column ; gap:0.5rem ; align-items:flex-start }
    .certificate-image-container { margin-top:1rem ; cursor: zoom-in }
    .certificate-image { max-width: 150px ; height:auto ; border:1px solid #fff ; padding:10px }
    .dynamic-image { height: 71px ; width: auto ; display:block }
    .name-text { font-size:1.3rem ; font-weight:bold ; text-transform:uppercase ; word-break:break-word }
    .nav-arrows { 
        position:fixed ; top:50% ; left:0 ; width:100% ; transform: translateY(-50%) ; 
        z-index:1000 ; display:flex ; justify-content:space-between ; padding:0 20px ;
        pointer-events: none 
    }
    .nav-arrow {
        transform: scaleY(1.5) ; color:#fff ; border:none ;
        width:60px ; height:160px ; display:flex ; align-items:center ; justify-content:center ;
        font-size:60px ; text-decoration:none ; transition:all 0.3s ease ; opacity:0.7 ;
        clip-path:polygon(0% 0%, 100% 25%, 100% 75%, 0% 100%) ; pointer-events: auto
    }
    .nav-arrow.right { transform:scaleX(-1) scaleY(1.5) }
    .nav-arrow:hover { opacity:1 ; transform: scaleY(1.5) scale(1.25) ; transform-origin:center }
    .nav-arrow.right:hover { transform:scaleX(-1) scaleY(1.5) scale(1.25) }
    .nav-arrow.disabled { opacity:0.2 ; cursor:default ; pointer-events:none }
    .detail-row {
        display:flex ; align-items:center ; margin-bottom:1.5rem ; border-bottom:1px solid #333 ; padding-bottom:1rem }
    .detail-row:last-child { border-bottom: none }
    .detail-label { width:300px ; min-width:200px ; color:#aaa ; font-size:1.1rem ; text-transform:uppercase ; letter-spacing:1px ; font-weight:600 }
    .detail-value { flex:1 ; font-size:1.3rem ; font-weight:bold ; text-transform:uppercase ; word-break:break-word }
    .detail-value img[src*="/publishers/"] { margin: -15px 0 -11px } /* tighten publisher logo y-spacing */
    .detail-value img[src*="/signatures/"] { opacity: 0.8 ; margin-top: 6px ; width: 176px ; height: auto }
    .signature-with-icon { display:flex ; flex-direction:column ; gap:0.5rem ; align-items:flex-start }
    .signature-image-container { margin-top:0.5rem }
    .signature-image { width:100px ; height:auto ; filter:invert(1) ; border:1px solid #fff ; padding:5px }
    .qr-code-value { display:flex ; align-items:center ; gap:1rem }
    .qr-code { background:#fff ; padding:10px ; max-width:150px ; max-height:150px ; filter:invert(1) }
    .notes-section { border:2px dashed #fff ; padding:2rem ; margin-top:3rem }
    .notes-label { font-size:1.5rem ; font-weight:bold ; margin-bottom:1rem ; text-transform:uppercase }
    .notes-content { font-size:1.2rem ; line-height:1.6 }
    footer {
        margin-top:5rem ; padding:5rem 0 4rem 0 ; border-top:1px solid #333 ; text-align:center ; color:#fff ;
        font-size:1.6rem ; text-transform:uppercase
    }
    .footer-links { display:flex ; justify-content:center ; gap:0 ; align-items:center ; margin-top:2rem }
    .footer-links a {
        color:#fff ; text-decoration:none ; font-weight:bold ; text-transform:uppercase ; letter-spacing:1px ;
        padding:0 0.8rem ; cursor: pointer
    }
    .footer-links a:hover { text-decoration:underline }
    .footer-separator { height:2.5rem ; width:1px ; background:#fff ; transform:rotate(15deg) ; margin:3px 1rem 0 }
    .image-placeholder { width:100% ; height:400px ; border:3px dashed #fff ; display:flex ; align-items:center ; justify-content:center ; color:#888 ; font-size:1.5rem ; padding:2rem }
    .error-message { font-size:2.5rem ; color:#ccc ; text-align:center ; padding:4rem ; border:3px dashed #fff ; margin:2rem 0 }
    .comic-pages { margin-top: 6.5rem ; display: flex ; flex-direction: column ; align-items: center }
    .comic-title { font-size: 1.5rem ; font-weight: bold ; margin-bottom: 3.5rem ; text-transform: uppercase ; text-align: center ; width: 100% }
    .comic-page {
        max-width: 800px ; margin-bottom: 2rem ; text-align: center ; width: 100% ; display: flex ;
        flex-direction: column ; align-items: center
    }
    .page-number { font-size: 0.9rem ; color: #aaa ; margin: 1rem 0 0.5rem ; text-transform: uppercase }
    .comic-page img { width: 100%; max-width: 100%; height: auto; display: block; margin: 0 auto }
    .back-to-top {
        position:fixed ; bottom: -13px ; right:21px ; width:70px ; height:220px ;
        border:none ; cursor:pointer ; opacity:0 ;
        transform: translateY(20px) scaleX(1.5) ; transition:all 0.3s ease ;
        z-index:100 ; color:#fff ; text-decoration:none ; padding:0 ;
        display:flex ; flex-direction:column ; align-items:center ; justify-content:center ;
        clip-path:polygon(0% 0%, 100% 25%, 100% 75%, 0% 100%) ; gap:0
    }
    .back-to-top::before, .back-to-top::after, .back-to-top span {
        content:"^" ; font-size:50px ; line-height:0.2 ; transform: scaleY(0.77) ;
        margin:0 ; display:block ; opacity:0.7
    }
    .back-to-top span { content:"" }
    .back-to-top.visible { opacity:0.7 ; transform: translateY(0) scaleX(1.5) }
    .back-to-top:hover { opacity:1 ; transform: translateY(0) scaleX(1.5) scale(1.2) }
    .back-to-top:hover::before, .back-to-top:hover::after, .back-to-top:hover span { opacity:1 }
    .back-to-top.at-top { pointer-events:none ; opacity:0 }
    @media (max-width:768px) {
        .container { padding-top:3rem } /* Certificate pages back to 3rem */
        .homepage .container { padding-top:5rem } /* Homepage still has extra */
        .hero-big { font-size:6rem }
        .homepage .hero-big { font-size:8rem } /* Only homepage gets larger on mobile */
        .hero-small { font-size:1.2rem }
        input, .search-btn { font-size:1.5rem ; padding:1.2rem }
        .cert-header { flex-direction:column ; gap:1rem ; text-align:center }
        .serial-num { font-size:2rem }
        .header-right { flex-direction:column ; width:100% }
        .download-section { flex-direction:column ; width:100% ; gap:0.5rem }
        .cert-body { flex-direction:column ; gap:2rem }
        .detail-row { flex-direction:column ; gap:0.5rem ; align-items:flex-start }
        .detail-label, .detail-value { width:100% ; font-size:1.1rem }
        .cert-type-with-icon { flex-direction:column ; align-items:flex-start }
        .qr-code-value { flex-direction:column ; align-items:flex-start }
        .cert-image { order:-1 }
        .status-badge { padding:0.6rem 1.5rem ; font-size:1.1rem }
        .checkmarks { font-size:1.5rem }
        footer { font-size:1.4rem ; padding:4rem 0 3rem 0 ; margin-top:4rem }
        .footer-links { flex-direction:column ; gap:0.5rem ; margin-top:1.5rem }
        .footer-separator { display:none }
        .footer-links a { padding:0.5rem 0 }
        .nav-arrow { width:50px ; height:120px ; font-size:45px }
        .error-message { font-size:2rem ; padding:3rem }
    }
    @media (max-width:480px) { 
        .container { padding-top:3rem } /* Certificate pages back to 3rem */
        .homepage .container { padding-top:4rem } /* Homepage still has extra */
        .hero-big { font-size:4rem }
        .homepage .hero-big { font-size:5rem } /* Only homepage gets larger on mobile */
        body { padding:10px }
        footer { font-size:1.3rem ; padding:3rem 0 2rem 0 ; margin-top:3rem }
        .nav-arrow { width:40px ; height:100px ; font-size:35px }
        .error-message { font-size:1.5rem ; padding:2rem }
    }`
