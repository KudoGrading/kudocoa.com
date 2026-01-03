export function initDownloadButtons() {
    document.querySelectorAll('.download-btn').forEach(btn =>
        btn.addEventListener('click', async event => {
            event.preventDefault()
            const url = btn.getAttribute('data-url'),
                  filename = btn.getAttribute('data-filename')
            try {
                const downloadURL = URL.createObjectURL(await (await fetch(url)).blob()),
                      a = document.createElement('a')
                a.style.display = 'none' ; a.href = downloadURL ; a.download = filename ; document.body.append(a)
                a.click() ; URL.revokeObjectURL(downloadURL) ; a.remove()
            } catch (err) { open(url, '_blank') }
        })
    )
}
