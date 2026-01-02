import * as string from '../lib/string.js'
import * as imgDisplay from './img-display.js'

export function generate({ certID, certData }) {
    const rows = []
    for (const [key, val] of Object.entries(certData)) {
        if (/(?:Notes|interiorURL)$/i.test(key)) continue

        const label = string.camelToTitleCase(key)
        let displayVal = /date/i.test(key) ? string.formatDate(val) : val.toString().toUpperCase()

        if (/By$/i.test(key)) { // human attr
            displayVal = displayVal.replace(/[,&]/g, ' +') // separate names w/ pluses
            if (/(?:authenticated|graded)by$/i.test(key)) { // replace names w/ sig
                const imgName = val.toString().toLowerCase()
                    .replace(/[&,+]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                const imgURL = `https://cdn.jsdelivr.net/gh/KudoGrading/certificates/assets/images/signatures/${imgName}/white.png`
                displayVal = imgDisplay.generate(imgURL, displayVal)
            }
        }

        if (/^publisher$/i.test(key)) { // replace publisher w/ logo
            const publisherSlug = val.toString().toLowerCase()
                .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            const logoURL = `https://cdn.jsdelivr.net/gh/KudoComics/assets/images/logos/publishers/${publisherSlug}/white.png`
            displayVal = imgDisplay.generate(logoURL, displayVal)
        }

        if (/^coa/i.test(key) && /certificate/i.test(displayVal)) // render COAs
            displayVal = `
                <div class="cert-type-with-icon">
                    <div class="certificate-image-container">
                        <img src="https://cdn.jsdelivr.net/gh/KudoGrading/certificates/coas/${certID}/certificate.png" 
                            alt="Certificate Image" class="certificate-image" onerror="this.style.display='none'">
                    </div>
                    <div class="cert-type-text">${displayVal}</div>
                </div>
            `

        rows.push(`
            <div class="detail-row">
                <div class="detail-label">${label}:</div>
                <div class="detail-value">${displayVal}</div>
            </div>
        `)
    }

    return rows.join('')
}
