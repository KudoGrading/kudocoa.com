import * as string from '../lib/string.js'
import * as imgEmbed from './img-embed.js'

export { default as css } from '../../../public/css/components/server/cert-data-rows.min.css'

export function generate({ certID, certData, debugMode }) {
    const dataRows = [], { urls } = app
    for (const [key, val] of Object.entries(certData)) {
        if (/(?:Notes|URLs?)$/.test(key)) continue

        const label = string.camelToTitleCase(key) ; let displayVal = val

        if (/(?:^d|[a-z]D)ate(?:[A-Z]|$)/.test(key)) // format date
            displayVal = string.formatDate(val, { debugMode })

        else if (key == 'publisher') { // replace publisher w/ logo
            const publisherSlug = string.toHyphenCase(val),
                  imgURL = `${urls.assetHost.comic}/images/logos/publishers/${publisherSlug}/white.png`
            displayVal = imgEmbed.generate({ imgURL, alt: displayVal })

        } else if (key.endsWith('By')) { // format human names
            displayVal = displayVal.replace(/[,&]/g, ' +') // separate names w/ pluses
            if (/(?:authenticat|grad)edBy$/i.test(key)) { // replace names w/ sig
                const signerSlug = string.toHyphenCase(val),
                      imgURL = `${urls.assetHost.cert}/assets/images/signatures/${signerSlug}/white.png`
                displayVal = imgEmbed.generate({ imgURL, alt: displayVal })
            }

        } else if (key == 'coaType' && /\bcertificate\b/i.test(displayVal)) // render COAs
            displayVal = `
                <div class="coa-type">
                    <div class="coa-img-container">
                        <img src="${urls.assetHost.cert}/coas/${certID}/certificate.png" 
                             alt="Kudo COA # ${certID}" class="coa-img" onerror="this.style.display='none'">
                    </div>
                    <div>${displayVal}</div>
                </div>
                <style>${imgEmbed.css}</style>
            `

        dataRows.push(`
            <div class="detail-row">
                <div class="detail-label">${label}:</div>
                <div class="detail-val">${displayVal}</div>
            </div>
        `)
    }

    return dataRows.join('')
}
