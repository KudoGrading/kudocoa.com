import * as search from '../components/search.js'

export function initHomepage(baseURL) {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum'),
              btn = document.getElementById('verifyBtn')
        search.init({ input, btn, baseURL }) ; input.focus()
        addEventListener('pageshow', () => search.reset({ input, btn }))
    })
}
