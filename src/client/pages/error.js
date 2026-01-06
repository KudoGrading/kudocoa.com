import * as search from '../components/search.js'

export function initErrPage() {
    document.addEventListener('DOMContentLoaded', () =>
        search.init({ input: document.querySelector('.search-bar input'), focus: true }))
}
