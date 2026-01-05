import { initSearch } from '../components/search.js'

export function initHomepage(baseURL) {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum'),
              btn = document.getElementById('verifyBtn')
        initSearch({ input, btn, baseURL }) ; input.focus()
        resetSearch() ; addEventListener('pageshow', resetSearch)
        function resetSearch() { btn.disabled = false ; btn.textContent = 'Verify Certificate' ; input.focus() }
    })
}
