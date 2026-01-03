import { initSearch } from '../shared/verify.js'

export function initHomePage(baseURL) {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum'),
              btn = document.getElementById('verifyBtn')
        initSearch(input, btn, baseURL) ; input.focus()
        resetUI() ; addEventListener('pageshow', resetUI)
        function resetUI() {
            btn.disabled = false ; btn.textContent = 'Verify Certificate'
            input.focus() ; const val = input.value ; input.value = '' ; input.value = val
        }
    })
}
