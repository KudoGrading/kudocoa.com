import * as string from '../lib/string.js'
import * as imgEmbed from './img-embed.js'

export function generate({ certID, certData }) {
    const rows = [], jsdBaseURL = 'https://cdn.jsdelivr.net/gh'
    for (const [key, val] of Object.entries(certData)) {
        if (/(?:Notes|URLs?)$/.test(key)) continue

        const label = string.camelToTitleCase(key)
        let displayVal = /date/i.test(key) ? string.formatDate(val) : val.toString().toUpperCase()

        if (/^publisher$/.test(key)) { // replace publisher w/ logo
            const publisherSlug = val.toString().toLowerCase()
                .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            const logoURL = `${jsdBaseURL}/KudoComics/assets/images/logos/publishers/${publisherSlug}/white.png`
            displayVal = imgEmbed.generate({ logoURL, alt: displayVal })

        } else if (/By$/i.test(key)) { // human attr
            displayVal = displayVal.replace(/[,&]/g, ' +') // separate names w/ pluses
            if (/(?:authenticat|grad)edBy$/i.test(key)) { // replace names w/ sig
                const imgName = val.toString().toLowerCase()
                    .replace(/[&,+]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                const imgURL = `${jsdBaseURL}/KudoGrading/certificates/assets/images/signatures/${imgName}/white.png`
                displayVal = imgEmbed.generate({ imgURL, alt: displayVal })
            }

        } else if (/^coa/.test(key) && /certificate/i.test(displayVal)) // render COAs
            displayVal = `
                <div class="coa-type">
                    <div class="coa-img-container">
                        <img src="${jsdBaseURL}/KudoGrading/certificates/coas/${certID}/certificate.png" 
                            alt="Certificate Image" class="coa-img" onerror="this.style.display='none'">
                    </div>
                    <div>${displayVal}</div>
                </div>
            `

        rows.push(`
            <div class="detail-row">
                <div class="detail-label">${label}:</div>
                <div class="detail-val">${displayVal}</div>
            </div>
        `)
    }

    return rows.join('')
}
