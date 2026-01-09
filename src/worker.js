import * as headers from './server/lib/headers.js'
import * as html from './server/lib/html.js'

globalThis.config = {
    ip: 'localhost',
    port: 8888,
    cacheDuration: 0, // int (secs) or 'auto'
    minifyHTML: 'auto' // <true|false> or 'auto'
}

export default {
    async fetch(req, env) {
        const url = new URL(req.url),
              devMode = env.ENVIRONMENT == 'development',
              debugMode = url.searchParams.has('debug'),
              baseURL = devMode ? `http://${config.ip}:${config.port}` : url.origin

        if (/^\/assets\/?$/.test(url.pathname)) // redir assets index to homepage
            return Response.redirect(`${baseURL}/${url.search}`, 302)

        else if (url.pathname.startsWith('/assets/')) { // serve public/ asset
            const assetPath = url.pathname.replace('/assets', '').replace(/(?<!\.min)\.js$/i, '.min.js'),
                  resp = await env.ASSETS.fetch(new Request(new URL(assetPath, req.url), req)),
                  fileExt = url.pathname.split('.').pop().toLowerCase(),
                  contentType = (await import('../public/data/mime-types.json'))[fileExt] || 'application/octet-stream'
            return new Response(resp.body, {
                status: resp.status, headers: { 'Content-Type': contentType, ...Object.fromEntries(resp.headers) }})

        } else if (url.pathname == '/') { // render homepage
            const homepage = await import('./server/templates/home.js')
            return new Response(
                html.process({ html: homepage.generate(devMode), devMode }),
                { headers: headers.create({ type: 'html' })}
            )
        }

        // Validate cert #
        const certInput = url.pathname.split('/')[1],
              errPage = await import('./server/templates/error.js')
        if (/\D/.test(certInput)) // 400 error
            return new Response(
                html.process({ html: errPage.generate({
                    certID: certInput, errMsg: 'Invalid certificate ID (numbers only!)', status: 400, devMode
                        })}, devMode),
                { headers: headers.create({ type: 'html' }), status: 400 }
            )
        const certID = certInput.padStart(10, '0')
        if (certID.length > 10) // 400 error
            return new Response(
                html.process({ html: errPage.generate({
                    certID, errMsg: 'Certificate ID too long (max 10 digits!)', status: 400, devMode
                        })}, devMode),
                { headers: headers.create({ type: 'html' }), status: 400 }
            )
        if (certInput != certID) // 301 redir e.g. /1 to /0000000001
            return Response.redirect(`${baseURL}/${certID}${url.search}`, 301)

        // Render cert page
        try {
            const certData = await env.COAS_KV.get(certID)
            if (!certData) // 404 error
                return new Response(
                    html.process({ html: errPage.generate({
                        certID, errMsg: 'Not found', status: 404, devMode })}, devMode),
                    { headers: headers.create({ type: 'html' }), status: 404 }
                )
            const certPage = await import('./server/templates/cert.js')
            return new Response(
                html.process({ html: await certPage.generate({
                    certID, certData, devMode, debugMode })}, devMode),
                { headers: { ...headers.create({ type: 'html' }), ...headers.create({ type: 'cache', certData })}}
            )
        } catch (err) { // 500 error
            return new Response(
                html.process({ html: errPage.generate({
                    errMsg: `System error: ${err.message}`, status: 500, devMode })}, devMode),
                { headers: headers.create({ type: 'html' }), status: 500 }
            )
        }
    }
}
