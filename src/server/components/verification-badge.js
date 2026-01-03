export function generate(certData) {

    // Count verifications
    const cnts = { art: 0, sig: 0 }
    Object.entries(certData).forEach(([key, val]) => {
        const label = key.toLowerCase(),
              strVal = val.toLowerCase().replace(/&/g, '+')
        cnts.commasAndPluses = ((strVal.match(/,/g) || []).length + (strVal.match(/\+/g) || []).length)
        if (/artwork|painted/i.test(label))  cnts.art += 1 + cnts.commasAndPluses
        if (/sign(?:ed|ature)/i.test(label)) cnts.sig += 1 + cnts.commasAndPluses
    })

    // Build label components
    let badgeText = ''
    if (cnts.art > 0 && cnts.sig > 0) {
        cnts.check = cnts.art + cnts.sig
        badgeText = `ARTWORK + ${ cnts.sig == 1 ? 'SIGNATURE' : cnts.sig + 'X SIGNATURES' } VERIFIED`
    } else if (cnts.art > 0) {
        cnts.check = cnts.art ; badgeText = 'ARTWORK VERIFIED'
    } else if (cnts.sig > 0) {
        cnts.check = cnts.sig ; badgeText = `${ cnts.sig == 1 ? 'SIGNATURE' : cnts.sig + 'X SIGNATURES' } VERIFIED`
    } else {
        cnts.check = 1 ; badgeText = 'VERIFIED'
    }
    const checkmarks = '✓'.repeat(Math.min(cnts.check, 10))

    return `
        <div class="verification-badge">
            <span class="checkmarks">${checkmarks}</span>
            <span class="status-text">${badgeText}</span>
        </div>`
}
