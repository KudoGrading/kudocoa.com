import * as homePage from './templates/home.js'
import * as certPage from './templates/cert.js'
import * as errPage from './templates/error.js'
import * as html from './lib/html.js'

export default {
    async fetch(req, env) {
        const url = new URL(req.url)

        // Render homepage
        if (/^\/?$/.test(url.pathname))
            return new Response(html.minify(homePage.generate()), { headers: { 'Content-Type': 'text/html' }})

        // Validate cert #
        const certInput = url.pathname.split('/')[1]
        if (!/^\d+$/.test(certInput))
            return new Response('Invalid certificate ID (numbers only)', { status: 400 })
        const certID = certInput.padStart(10, '0')
        if (certID.length > 10)
            return new Response('Certificate ID too long (max 10 digits)', { status: 400 })
        if (certInput != certID)
            return Response.redirect('https://kudocoa.com/' + certID, 301)

        // Render cert page
        try {
            const certDataRaw = await env.COAS_KV.get(certID)
            if (!certDataRaw) {
                const html = errPage.generate(certID, 'not found')
                return new Response(html.minify(html), {
                    headers: { 'Content-Type': 'text/html' },
                    status: 404
                })
            }

            const certData = JSON.parse(certDataRaw),
                  html = await certPage.generate(certID, certData)

            return new Response(html.minify(html), {
                headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=300' }})

        } catch (err) {
            const html = errPage.generate('', 'System error')
            return new Response(html.minify(html), { status: 500 })
        }
    }
}
