import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

const app = await import('../../../data/app.json')

export function generate(devMode) {
    app.urls.web = devMode ? 'http://127.0.0.1:8787' : app.urls.web
    app.urls.assetHost = devMode ? app.urls.web + '/assets' : app.urls.assetHost
    const title = app.name
    const description = `Verify certificate authenticity with ${app.fullName}`
    const bodyContent = `
        ${header.generate()}
        ${footer.generate()}
        
        <!-- Inject config and load frontend module -->
        <script type="module">
            import { initHomepage } from '${app.urls.assetHost}/js/pages/home.min.js'
            initHomepage(${app.urls.web})
        </script>
    `
    return base.generate({ title, description, bodyContent, bodyClass: 'homepage' })
}
