export function camelToTitleCase(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/\bAnd\b/gi, '/')
}

export function formatDate(dateStr) {
    if (!dateStr) return 'NOT SPECIFIED'
    try {
        if (/^\d{4}-\d{1,2}$/.test(dateStr)) {
            const [year, month] = dateStr.split('-').map(Number),
                  date = new Date(year, month - 1, 1)
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }).toUpperCase()
        }
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()
    } catch { return dateStr.toUpperCase() }
}
