import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

const app = await import('../../../public/data/app.json')

export function generate(devMode) {
    app.urls.web = devMode ? 'http://localhost:8888' : app.urls.web
    app.urls.assetHost = devMode ? app.urls.web + '/assets' : app.urls.assetHost
    const title = app.names.medium
    const description = `Verify certificate authenticity with ${app.names.long}`
    const bodyContent = `
        ${header.generate()}
        ${footer.generate()}
        <script type="module">
            import { initHomepage } from '${app.urls.assetHost}/js/pages/home.min.js'
            initHomepage('${app.urls.web}')
        </script>
    `
    return base.generate({ title, description, bodyContent, bodyClass: 'homepage' })
}
