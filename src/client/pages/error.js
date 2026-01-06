import * as search from '../components/search.js'

export function initErrPage() {
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('certNum')
        search.init({ input })
        addEventListener('pageshow', () => search.reset({ input }))
    })
}
