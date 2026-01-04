import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

const app = await import('../../../data/app.json')

export function generate(devMode) {
    app.urls.assetHost = devMode ? 'http://localhost:8787/assets' : app.urls.assetHost
    const title = app.name
    const description = `Verify certificate authenticity with ${app.fullName}`
    const bodyContent = `
        ${header.generate()}
        ${footer.generate()}
        
        <!-- Inject config and load frontend module -->
        <script type="module">
            import { initHomepage } from '${app.urls.assetHost}/js/pages/home.min.js'
            initHomepage(${JSON.stringify({ baseURL: app.urls.web, devMode })})
        </script>
    `
    return base.generate({ title, description, bodyContent, bodyClass: 'homepage' })
}
