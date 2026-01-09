import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

import homeCSS from '../../../public/css/pages/home.min.css'

const app = await import('../../../public/data/app.json')

export function generate({ config, devMode }) {
    app.urls.assetHost.app = devMode ? `http://${config.ip}:${config.port}` : app.urls.assetHost.app
    const title = app.names.medium
    const description = `Verify certificate authenticity with ${app.names.long}`
    const bodyContent = `
        ${header.generate()}
        ${footer.generate()}
        <script type="module">
            import { initHomepage } from '${app.urls.assetHost.app}/js/pages/home.min.js'
            initHomepage()
        </script>
    `
    return base.generate({ title, description, bodyContent, bodyClass: 'homepage', css: homeCSS })
}
