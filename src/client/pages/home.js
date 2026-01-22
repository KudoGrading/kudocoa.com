import * as search from '../components/search.js'

console.log('home.js running')

document.addEventListener('DOMContentLoaded', () =>
    search.init({ input: document.querySelector('.search-bar input'), autofocus: true }))
