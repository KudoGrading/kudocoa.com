import * as search from '../components/search.js'

export function initErrPage() {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum'),
              searchConfig = { input, focus: true }
        search.init(searchConfig)
        addEventListener('pageshow', () => search.reset(searchConfig))
    })
}
