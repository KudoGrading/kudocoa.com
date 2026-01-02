import * as homepage from './templates/home.js'
import * as certPage from './templates/cert.js'
import * as errPage from './templates/error.js'
import { minify } from './lib/html.js'

export default {
    async fetch(req, env) {
        const url = new URL(req.url)

        if (/^\/?$/.test(url.pathname)) // render homepage
            return new Response(minify(homepage.generate()), { headers: { 'Content-Type': 'text/html' }})

        // Validate cert #
        const certInput = url.pathname.split('/')[1]
        if (!/^\d+$/.test(certInput))
            return new Response('Invalid certificate ID (numbers only!)', { status: 400 })
        const certID = certInput.padStart(10, '0')
        if (certID.length > 10)
            return new Response('Certificate ID too long (max 10 digits!)', { status: 400 })
        if (certInput != certID)
            return Response.redirect('https://kudocoa.com/' + certID, 301)

        // Render cert page
        try {
            const certData = await env.COAS_KV.get(certID)
            return !certData ?
                new Response(minify(errPage.generate(certID, 'not found')), {
                    headers: { 'Content-Type': 'text/html' }, status: 404 })
              : new Response(minify(await certPage.generate(certID, JSON.parse(certData))), {
                    headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=300' }})
        } catch (err) {
            return new Response(minify(errPage.generate('', 'System error')), {
                    headers: { 'Content-Type': 'text/html' }, status: 500 })
        }
    }
}
