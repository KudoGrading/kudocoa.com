import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

const app = await import('../../../public/data/app.json')

export function generate({ certID, errMsg = 'Error', status = 404, devMode } = {}) {
    app.urls.web = devMode ? 'http://localhost:8888' : app.urls.web
    app.urls.assetHost = devMode ? app.urls.web + '/assets' : app.urls.assetHost
    const title = `${ certID ? `Kudo COA #${certID} / Certificate Not Found` : 'System Error' } / ${app.name}`
    const description = certID ? `Certificate # ${certID} not found` : 'System error occurred'
    const bodyContent = `
        ${header.generate(certID)}
        <div class="err-msg">
            <div class="err-code">${status}</div>
            <p>${ certID ? `Certificate # <strong>${certID}</strong> — ` : '' }${errMsg}</p>
        </div>
        ${footer.generate()}
        <script type="module">
            import { initErrPage } from '${app.urls.assetHost}/js/pages/error.min.js'
            initErrPage('${app.urls.web}')
        </script>
    `
    return base.generate({ title, description, bodyContent })
}
