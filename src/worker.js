import * as headers from './server/lib/headers.js'
import * as html from './server/lib/html.js'

globalThis.app = await import('../public/data/app.json')
globalThis.config = {
    env: { dev: { ip: 'localhost', port: 8888 }},
    cacheDuration: 0, // int (secs) or 'auto' (6h if non-video page, 0s otherwise)
    minifyHTML: 'auto' // <true|false> or 'auto' (false if dev mode)
}

export default {
    async fetch(req, env) {
        const reqURL = new URL(req.url)
        app.devMode = env.ENVIRONMENT == 'development'
        app.debugMode = reqURL.searchParams.has('debug')
        const baseURL = app.devMode ? `http://${config.env.dev.ip}:${config.env.dev.port}` : reqURL.origin
        app.urls.assetHost.app = app.devMode ? baseURL : app.urls.assetHost.app

        if (/^\/assets\/?$/.test(reqURL.pathname)) // redir assets index to homepage
            return Response.redirect(`${baseURL}/${reqURL.search}`, 302)

        else if (reqURL.pathname.startsWith('/assets/')) { // serve public/ asset
            const assetPath = reqURL.pathname.replace('/assets', '').replace(/(?<!\.min)\.js$/i, '.min.js'),
                  resp = await env.ASSETS.fetch(new Request(new URL(assetPath, req.url), req)),
                  fileExt = reqURL.pathname.split('.').pop().toLowerCase(),
                  contentType = (await import('../public/data/mime-types.json'))[fileExt] || 'application/octet-stream'
            return new Response(resp.body, {
                status: resp.status, headers: { 'Content-Type': contentType, ...Object.fromEntries(resp.headers) }})

        } else if (reqURL.pathname == '/') { // render homepage
            const homepage = await import('./server/templates/home.js')
            return new Response(html.process(homepage.generate()), { headers: headers.create({ type: 'html' })})
        }

        // Validate cert #
        const certInput = reqURL.pathname.split('/')[1],
              errPage = await import('./server/templates/error.js')
        if (/\D/.test(certInput)) // 400 error
            return new Response(
                html.process(errPage.generate({
                    certID: certInput, errMsg: 'Invalid certificate ID (numbers only!)', status: 400 })),
                { headers: headers.create({ type: 'html' }), status: 400 }
            )
        const certID = certInput.padStart(10, '0')
        if (certID.length > 10) // 400 error
            return new Response(
                html.process(errPage.generate({
                    certID, errMsg: 'Certificate ID too long (max 10 digits!)', status: 400 })),
                { headers: headers.create({ type: 'html' }), status: 400 }
            )
        if (certInput != certID) // 301 redir e.g. /1 to /0000000001
            return Response.redirect(`${baseURL}/${certID}${reqURL.search}`, 301)

        // Render cert page
        try {
            const certData = await env.COAS_KV.get(certID)
            if (!certData) // 404 error
                return new Response(
                    html.process(errPage.generate({ certID, errMsg: 'Not found', status: 404 })),
                    { headers: headers.create({ type: 'html' }), status: 404 }
                )
            const certPage = await import('./server/templates/cert.js')
            return new Response(
                html.process(await certPage.generate({ certID, certData })),
                { headers: { ...headers.create({ type: 'html' }), ...headers.create({ type: 'cache', certData })}}
            )
        } catch (err) { // 500 error
            return new Response(
                html.process(errPage.generate({ errMsg: `System error: ${err.message}`, status: 500 })),
                { headers: headers.create({ type: 'html' }), status: 500 }
            )
        }
    }
}
