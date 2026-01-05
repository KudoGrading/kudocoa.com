import * as search from '../components/search.js'

export function initHomepage(baseURL) {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum')
        search.init({ input, baseURL })
        addEventListener('pageshow', () => search.reset({ input }))
    })
}
