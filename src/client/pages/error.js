import * as search from '../components/search.js'

export function initErrPage() {
    document.addEventListener('DOMContentLoaded', () => {
        const searchConfig = { input: document.getElementById('certNum'), focus: true }
        search.init(searchConfig) ; addEventListener('pageshow', () => search.reset(searchConfig))
    })
}
