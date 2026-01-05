import * as string from '../lib/string.js'
import * as imgEmbed from './img-embed.js'

const app = await import('../../../public/data/app.json')

export function generate({ certID, certData }) {
    const dataRows = []
    for (const [key, val] of Object.entries(certData)) {
        if (/(?:Notes|URLs?)$/.test(key)) continue

        const label = string.camelToTitleCase(key)
        let displayVal = /(?:^d|[a-z]D)ate(?:[A-Z]|$)/.test(key) ? string.formatDate(val) : val.toUpperCase()

        if (key == 'publisher') { // replace publisher w/ logo
            const publisherSlug = string.toHyphenCase(val),
                  imgURL = `${app.urls.comicAssetHost}/images/logos/publishers/${publisherSlug}/white.png`
            displayVal = imgEmbed.generate({ imgURL, alt: displayVal })

        } else if (key.endsWith('By')) { // human attr
            displayVal = displayVal.replace(/[,&]/g, ' +') // separate names w/ pluses
            if (/(?:authenticat|grad)edBy$/i.test(key)) { // replace names w/ sig
                const signerSlug = string.toHyphenCase(val),
                      imgURL = `${app.urls.cdn}/certificates/assets/images/signatures/${signerSlug}/white.png`
                displayVal = imgEmbed.generate({ imgURL, alt: displayVal })
            }

        } else if (key == 'coaType' && /certificate/i.test(displayVal)) // render COAs
            displayVal = `
                <div class="coa-type">
                    <div class="coa-img-container">
                        <img src="${app.urls.cdn}/certificates/coas/${certID}/certificate.png" 
                             alt="Certificate Image" class="coa-img" onerror="this.style.display='none'">
                    </div>
                    <div>${displayVal}</div>
                </div>
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
