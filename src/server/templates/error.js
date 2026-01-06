import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

const app = await import('../../../public/data/app.json')

export function generate({ certID, errMsg = 'Error', status = 404, devMode } = {}) {
    app.urls.web = devMode ? 'http://localhost:8888' : app.urls.web
    app.urls.assetHost.app = devMode ? app.urls.web + '/assets' : app.urls.assetHost.app
    const title = `${
        certID ? `${app.names.short} #${certID} / Certificate Not Found` : 'System Error' } / ${app.names.medium}`
    const description = certID ? `Certificate # ${certID} not found` : 'System error occurred'
    const bodyContent = `
        ${header.generate(certID)}
        <div class="err-msg">
            <div class="err-code">${status}</div>
            <p>${ certID ? `Certificate # <strong>${certID}</strong> — ` : '' }${errMsg}</p>
        </div>
        ${footer.generate()}
        <script type="module">
            import { initErrPage } from '${app.urls.assetHost.app}/js/pages/error.min.js'
            initErrPage()
        </script>
    `
    return base.generate({ title, description, bodyContent })
}
