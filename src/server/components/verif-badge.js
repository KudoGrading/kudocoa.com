import verifBadgeCSS from '../../../public/css/components/server/verif-badge.min.css'

export const css = verifBadgeCSS

export function generate(certData) {

    // Count verifications
    const cnts = { art: 0, sig: 0 }
    Object.entries(certData).forEach(([key, val]) => {
        if (typeof val != 'string') return
        val = val.toLowerCase().replace(/&/g, '+')
        cnts.commasAndPluses = (val.match(/,|\+/g) || []).length
        if (/artwork|painted/i.test(key))  cnts.art += 1 + cnts.commasAndPluses
        if (/sign(?:ed|ature)/i.test(key)) cnts.sig += 1 + cnts.commasAndPluses
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
        <div class="verif-badge">
            <span class="checkmarks">${checkmarks}</span>
            <span class="status-text">${badgeText}</span>
        </div>
    `
}
