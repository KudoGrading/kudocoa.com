import { minify } from './server/lib/html.js'
import * as homepage from './server/templates/home.js'
import * as certPage from './server/templates/cert.js'
import * as errPage from './server/templates/error.js'

const mimeTypes = await import('../public/data/mime-types.json')
const config = {
    staticCacheTime: 21600, // 6h
    videoCacheTime: 5 // sec
}

export default {
    async fetch(req, env) {
        const url = new URL(req.url),
              htmlHeaders = { 'Content-Type': 'text/html' },
              devMode = env.ENVIRONMENT == 'development',
              baseURL = `http${ devMode ? '://localhost:8888' : 's://' + url.hostname }`

        if (/^\/assets\/?$/.test(url.pathname)) // redir assets index to homepage
            return Response.redirect(`${baseURL}/`, 302)

        else if (url.pathname.startsWith('/assets/')) { // serve public/ asset
            const assetPath = url.pathname.replace('/assets', '').replace(/(?<!\.min)\.js$/i, '.min.js'),
                  resp = await env.ASSETS.fetch(new Request(new URL(assetPath, req.url), req)),
                  fileExt = url.pathname.split('.').pop().toLowerCase(),
                  contentType = mimeTypes[fileExt] || 'application/octet-stream'
            return new Response(resp.body, {
                status: resp.status, headers: { 'Content-Type': contentType, ...Object.fromEntries(resp.headers) }})

        } else if (url.pathname == '/') // render homepage
            return new Response(minify(homepage.generate(devMode)), { headers: htmlHeaders })

        // Validate cert #
        const certInput = url.pathname.split('/')[1]
        if (/\D/.test(certInput))
            return new Response(minify(errPage.generate({
                certID: certInput, errMsg: 'Invalid certificate ID (numbers only!)', devMode, status: 400 })), {
                    headers: htmlHeaders, status: 400 })
        const certID = certInput.padStart(10, '0')
        if (certID.length > 10)
            return new Response(minify(errPage.generate({
                certID, errMsg: 'Certificate ID too long (max 10 digits!)', devMode, status: 400 })), {
                    headers: htmlHeaders, status: 400 })
        if (certInput != certID) // redir e.g. /1 to /0000000001
            return Response.redirect(`${baseURL}/${certID}`, 301)

        // Render cert page
        try {
            const certData = await env.COAS_KV.get(certID)
            const hasVideo = /(?:trailer|vide?o?|youtube|yt)URLs?/.test(JSON.stringify(certData))
            const cacheHeaders = { // shorter for video pages to allow rotation
                'Cache-Control': `public, max-age=${config[`${ hasVideo ? 'video' : 'static' }CacheTime`]}` }
            return !certData ?
                new Response(minify(errPage.generate({ certID, errMsg: 'Not found', devMode, status: 404 })), {
                    headers: htmlHeaders, status: 404 })
              : new Response(minify(await certPage.generate({ certID, certData, devMode })), {
                    headers: { ...htmlHeaders, ...cacheHeaders }})
        } catch (err) {
            return new Response(minify(errPage.generate({
                errMsg: 'System error: ' + err.message, devMode, status: 500 })), {
                    headers: htmlHeaders, status: 500 })
        }
    }
}
