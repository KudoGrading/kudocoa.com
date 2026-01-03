export function camelToTitleCase(str) { // e.g. 'gradedAndAuthenticatedBy' => 'Graded / Authenticated By'
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/\bAnd\b/gi, '/') }

export function formatDate(dateStr, { format = 'monthDayYear', caseStyle = 'upper' } = {}) { // e.g. '2026-1' => 'JANUARY 2026'
    if (!dateStr) throw new Error(`'dateStr' option required by formatDate()`)
    try {
        let result
        if (/^\d{4}-\d{1,2}$/.test(dateStr) || format == 'monthYear') { // YYYY-MM input
            const [year, month] = dateStr.split('-').map(Number)
            result = new Date(year, month -1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        } else if (format == 'monthDayYear')
            result = new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        else
            result = dateStr
        return caseStyle == 'upper' ? result.toUpperCase() : result
    } catch (err) { return dateStr }
}

export function toHyphenCase(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
