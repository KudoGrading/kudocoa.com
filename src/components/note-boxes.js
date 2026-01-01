import * as string from '../lib/string.js'

export function generate(certData) {
    const notes = []
    for (const [key, val] of Object.entries(certData)) {
        if (!/Notes$/i.test(key) || !val) continue
        let adj = string.camelToTitleCase(key.replace(/Notes$/i, ''))
        if (adj.endsWith('s')) adj = adj.slice(0, -1) + `'s`
        notes.push({ label: `${adj} Notes`, content: val })
    }
    return !notes.length ? '' : notes.map(note => `
        <div class="notes-section">
            <div class="notes-label">${note.label}</div>
            <div class="notes-content">${note.content}</div>
        </div>
    `).join('')
}
