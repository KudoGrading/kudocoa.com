import { createLogger } from '../lib/log.js'

export function camelToTitleCase(str) { // e.g. 'gradedAndAuthenticatedBy' => 'Graded / Authenticated By'
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/\bAnd\b/gi, '/') }

export function formatDate(dateStr, { format = 'monthDayYear', caseStyle = 'upper', debugMode = false } = {}) {
    // e.g. '2026-1' => 'JANUARY 2026' and '1999-3-3' => 'MARCH 3, 1999'
    const log = createLogger({ prefix: 'string.formatDate()', debugMode })
    if (!dateStr) return log.error(`'dateStr' option required!`)
    try {
        log.debug(`Formatting ${dateStr}...`)
        let result
        if (/^\d{4}-\d{1,2}$/.test(dateStr) || format == 'monthYear') { // YYYY-MM input
            const [year, month] = dateStr.split('-').map(Number)
            result = new Date(year, month -1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        } else if (format == 'monthDayYear')
            result = new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        else
            result = dateStr
        log.debug('result:', result)
        return caseStyle == 'upper' ? result.toUpperCase() : result
    } catch (err) { log.error(err.msg) ; return dateStr }
}

export function toHyphenCase(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
