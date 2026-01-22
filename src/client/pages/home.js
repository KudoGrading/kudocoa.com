import * as search from '../components/search.js'

document.addEventListener('DOMContentLoaded', () =>
    search.init({ input: document.querySelector('.search-bar input'), autofocus: true }))
