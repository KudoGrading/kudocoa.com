import { initSearch } from '../shared/verify.js'

export function initHomePage(baseURL) {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum'),
              button = document.getElementById('verifyBtn')
        initSearch(input, button, baseURL) ; input.focus()
        resetUI() ; addEventListener('pageshow', resetUI)
        function resetUI() {
            button.disabled = false ; button.textContent = 'Verify Certificate'
            input.focus() ; const val = input.value ; input.value = '' ; input.value = val
        }
    })
}
