export function initDownloadBtns() {
    document.querySelectorAll('.download-btn').forEach(btn =>
        btn.onclick = async event => {
            event.preventDefault()
            const url = btn.dataset.url,
                  download = btn.dataset.filename
            try {
                const href = URL.createObjectURL(await (await fetch(url)).blob()),
                      a = Object.assign(document.createElement('a'), { href, download, style: 'display: none' })
                document.body.append(a) ; a.click() ; a.remove() ; URL.revokeObjectURL(href)
            } catch (err) { open(url, '_blank') }
        }
    )
}
