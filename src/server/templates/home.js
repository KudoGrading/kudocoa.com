import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

import css from '../../../public/css/pages/home.min.css'

export function generate() {
    const title = app.names.medium
    const description = `Verify certificate authenticity with ${app.names.long}`
    const bodyContent = `
        ${header.generate()}
        ${footer.generate()}
        <script type="module" src="${app.urls.assetHost.app}/js/client/pages/home.min.js"></script>
    `
    return base.generate({ title, description, bodyContent, bodyClass: 'homepage', css })
}
