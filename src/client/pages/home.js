import * as search from '../components/search.js'

export function initHomepage() {
    document.addEventListener('DOMContentLoaded', () =>
        search.init({ input: document.querySelector('.search-bar input'), focus: true }))
}
