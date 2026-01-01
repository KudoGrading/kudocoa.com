export function generate(certData) {
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
