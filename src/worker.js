import { minify } from './lib/html.js'
import * as homepage from './templates/home.js'
import * as certPage from './templates/cert.js'
import * as errPage from './templates/error.js'

export default {
    async fetch(req, env) {
        const url = new URL(req.url), htmlHeader = { 'Content-Type': 'text/html' }

        if (/^\/?$/.test(url.pathname)) // render homepage
            return new Response(minify(homepage.generate()), { headers: htmlHeader })

        // Validate cert #
        const certInput = url.pathname.split('/')[1]
        if (!/^\d+$/.test(certInput))
            return new Response(minify(errPage.generate({
                certID: certInput, errMsg: 'Invalid certificate ID (numbers only!)' })), {
                    headers: htmlHeader, status: 400 }
            )
        const certID = certInput.padStart(10, '0')
        if (certID.length > 10)
            return new Response(minify(errPage.generate({
                certID, errMsg: 'Certificate ID too long (max 10 digits!)' })), { headers: htmlHeader, status: 400 })
        if (certInput != certID) // redir e.g. /1 to /0000000001
            return Response.redirect('https://kudocoa.com/' + certID, 301)

        // Render cert page
        try {
            const certData = await env.COAS_KV.get(certID)
            return !certData ?
                new Response(minify(errPage.generate({ certID, errMsg: 'Not found' })), {
                    headers: htmlHeader, status: 404 })
              : new Response(minify(await certPage.generate({ certID, certData })), {
                    headers: { ...htmlHeader, 'Cache-Control': 'public, max-age=300' }})
        } catch (err) {
            return new Response(minify(errPage.generate({ errMsg: 'System error' })), {
                    headers: htmlHeader, status: 500 })
        }
    }
}
