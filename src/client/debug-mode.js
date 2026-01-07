export function initDebugMode() { // append ?debug to all app links
    if (!location.search.includes('debug')) return
    console.log('[DEBUG MODE]')
    document.querySelectorAll('a[href]').forEach(link => {
        if (link.href.includes(location.origin) && !link.href.includes('?'))
            link.href = link.href + '?debug'
    })
}
