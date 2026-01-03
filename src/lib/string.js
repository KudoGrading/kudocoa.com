export function camelToTitleCase(str) { // e.g. 'gradedAndAuthenticatedBy' => 'Graded / Authenticated By'
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/\bAnd\b/gi, '/') }

export function formatDate(dateStr) { // e.g. '2026-1-1' => 'JANUARY 1, 2026'
    if (!dateStr) return 'NOT SPECIFIED'
    try {
        if (/^\d{4}-\d{1,2}$/.test(dateStr)) {
            const [year, month] = dateStr.split('-').map(Number),
                  date = new Date(year, month - 1, 1)
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }).toUpperCase()
        }
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()
    } catch (err) { return dateStr.toUpperCase() }
}

export function generatePageTitle({ certID, certData } = {}) { // e.g. 'Kudo COA #1 / NFL SuperPro #1 (1991) / Kudo Grading + Authentication'
    const yearMatch = (certData?.coverDate || certData?.publishDate)?.match(/\d{4}/),
          year = yearMatch ? ` (${yearMatch[0]})` : ''
    return `${ certID ? `Kudo COA #${parseInt(certID)} /` : '' }${
               certData?.item || '' }${year} / Kudo Grading + Authentication`
}
