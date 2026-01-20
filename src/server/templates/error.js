import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

import css from '../../../public/css/pages/error.min.css'

export function generate({ certID, errMsg = 'Error', status = 404 } = {}) {
    const title = `${ certID ? `${app.names.short} #${certID} / Certificate Not Found` : 'System Error' }`
                + ` / ${app.names.medium}`
    const description = certID ? `Certificate # ${certID} not found` : 'System error occurred'
    const bodyContent = `
        ${header.generate(certID)}
        <div class="err-msg">
            <div class="err-code">${status}</div>
            <p>${ certID ? `Certificate # <strong>${certID}</strong> — ` : '' }${errMsg}</p>
        </div>
        ${footer.generate()}
        <script type="module">
            import { initErrPage } from '${app.urls.assetHost.app}/js/client/pages/error.min.js'
            initErrPage()
        </script>
    `
    return base.generate({ title, description, bodyContent, css })
}
