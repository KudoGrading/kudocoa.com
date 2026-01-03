import { minify } from './server/lib/html.js'
import * as homepage from './server/templates/home.js'
import * as certPage from './server/templates/cert.js'
import * as errPage from './server/templates/error.js'

const app = await import('../data/app.json'),
      mimeTypes = await import('../data/mime-types.json')

export default {
    async fetch(req, env) {
        const url = new URL(req.url), htmlHeaders = { 'Content-Type': 'text/html' }

        if (url.hostname == 'cert.kudoauthentication.com') // redir to kudocoa.com/<path>
            return Response.redirect(url.toString().replace(url.hostname, 'kudocoa.com'), 301)

        else if (url.hostname == 'kudocoa.com') {

            if (/^\/assets\/?$/.test(url.pathname)) // redir assets index to homepage
                return Response.redirect(app.urls.web, 302)
            else if (url.pathname.startsWith('/assets/')) { // serve public/ asset
                const assetPath = url.pathname.replace('/assets', '').replace(/(?<!\.min)\.js$/i, '.min.js'),
                      resp = await env.ASSETS.fetch(new Request(new URL(assetPath, req.url), req)),
                      fileExt = url.pathname.split('.').pop().toLowerCase(),
                      contentType = mimeTypes[fileExt] || 'application/octet-stream'
                return new Response(resp.body, {
                    status: resp.status, headers: { 'Content-Type': contentType, ...Object.fromEntries(resp.headers) }})

            } else if (url.pathname == '/') // render homepage
                return new Response(minify(homepage.generate()), { headers: htmlHeaders })

            // Validate cert #
            const certInput = url.pathname.split('/')[1]
            if (!/^\d+$/.test(certInput))
                return new Response(
                    minify(errPage.generate({ certID: certInput, errMsg: 'Invalid certificate ID (numbers only!)' })), {
                        headers: htmlHeaders, status: 400 })
            const certID = certInput.padStart(10, '0')
            if (certID.length > 10)
                return new Response(
                    minify(errPage.generate({ certID, errMsg: 'Certificate ID too long (max 10 digits!)' })), {
                        headers: htmlHeaders, status: 400 })
            if (certInput != certID) // redir e.g. /1 to /0000000001
                return Response.redirect(`${app.urls.web}/${certID}`, 301)

            // Render cert page
            try {
                const certData = await env.COAS_KV.get(certID)
                return !certData ?
                    new Response(minify(errPage.generate({ certID, errMsg: 'Not found' })), {
                        headers: htmlHeaders, status: 404 })
                  : new Response(minify(await certPage.generate({ certID, certData })), {
                        headers: { ...htmlHeaders, 'Cache-Control': 'public, max-age=300' }})
            } catch (err) {
                return new Response(minify(errPage.generate({ errMsg: 'System error: ' + err.message })), {
                        headers: htmlHeaders, status: 500 })
            }
        }
    }
}
