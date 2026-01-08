import { createLogger } from '../../../shared/lib/log.js'

export function initDownloadBtns() {
    const log = createLogger({ prefix: 'initDownloadBtns()', debugMode: location.search.includes('debug') })
    log.debug('Initializing download buttons...')
    const downloadBtns = []
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.onclick = async event => {
            event.preventDefault()
            const url = btn.dataset.url,
                  download = btn.dataset.filename,
                  filetype = btn.textContent.trim()
            log.debug(`${filetype} button clicked`)
            try {
                const href = URL.createObjectURL(await (await fetch(url)).blob()),
                      a = Object.assign(document.createElement('a'), { href, download, style: 'display: none' })
                document.body.append(a) ; a.click() ; a.remove() ; URL.revokeObjectURL(href)
                log.debug(`${filetype} download initiated!`)
            } catch (err) {
                log.debug(`Failed to initiate ${filetype} download!`)
                open(url, '_blank')
            }
        }
        downloadBtns.push(btn)
    })
    const btnTypes = downloadBtns.map(btn => btn.textContent.trim())
    log.debug(`${ downloadBtns.length || 'No' } button${ downloadBtns.length == 1 ? '' : 's' } initialized! (${
        btnTypes.join(' + ')})`)
}
