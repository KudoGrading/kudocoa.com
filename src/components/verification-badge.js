export function generate(certData) {

    // Count verifications
    const cnts = { art: 0, sig: 0 }
    Object.entries(certData).forEach(([key, val]) => {
        const label = key.toLowerCase(),
              valStr = val.toString().toLowerCase().replace(/&/g, '+'),
              commasAndPluses = ((valStr.match(/,/g) || []).length + (valStr.match(/\+/g) || []).length)
        if (/artwork|painted/i.test(label)) cnts.art += 1 + commasAndPluses
        if (/signed|signature|sign/i.test(label)) cnts.sig += 1 + commasAndPluses
    })

    // Build label
    let badgeText = '', totalChecks = 0
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
