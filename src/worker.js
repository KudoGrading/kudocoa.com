const config = {
    cacheDuration: 21600, // 6h
    minifyHTML: 'auto' // <true|false> or 'auto'
}

export default {
    async fetch(req, env) {
        const url = new URL(req.url),
              headers = { html: { 'Content-Type': 'text/html' }},
              devMode = env.ENVIRONMENT == 'development',
              debugMode = url.searchParams.has('debug'),
              baseURL = devMode ? 'http://localhost:8888' : url.origin
        config.minifyHTML = config.minifyHTML == 'auto' ? !devMode : !!config.minifyHTML

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
            return new Response(await processHTML(homepage.generate(devMode)), { headers: headers.html })
        }

        // Validate cert #
        const certInput = url.pathname.split('/')[1],
              errPage = await import('./server/templates/error.js')
        if (/\D/.test(certInput)) // 400 error
            return new Response(await processHTML(errPage.generate({
                certID: certInput, errMsg: 'Invalid certificate ID (numbers only!)', status: 400, devMode })), {
                    headers: headers.html, status: 400 })
        const certID = certInput.padStart(10, '0')
        if (certID.length > 10) // 400 error
            return new Response(await processHTML(errPage.generate({
                certID, errMsg: 'Certificate ID too long (max 10 digits!)', status: 400, devMode })), {
                    headers: headers.html, status: 400 })
        if (certInput != certID) // 301 redir e.g. /1 to /0000000001
            return Response.redirect(`${baseURL}/${certID}${url.search}`, 301)

        // Render cert page
        try {
            const certData = await env.COAS_KV.get(certID)
            if (!certData) // 404 error
                return new Response(await processHTML(errPage.generate({
                    certID, errMsg: 'Not found', status: 404, devMode })), {
                        headers: headers.html, status: 404 })
            const certPage = await import('./server/templates/cert.js')
            const hasVideo = /\\"(?:trailer|vide?o?|youtube|yt)URLs\\"/.test(JSON.stringify(certData))
            headers.cache = { // shorter for video pages to allow rotation
                'Cache-Control': hasVideo ? 'no-store, must-revalidate' : `public, max-age=${config.cacheDuration}` }
            return new Response(await processHTML(await certPage.generate({
                certID, certData, devMode, debugMode })), { headers: { ...headers.html, ...headers.cache }})
        } catch (err) { // 500 error
            return new Response(await processHTML(errPage.generate({
                errMsg: `System error: ${err.message}`, status: 500, devMode })), { headers: headers.html, status: 500 })
        }

        async function processHTML(html) {
            return config.minifyHTML ? (await import('./server/lib/html.js')).minify(html) : html }
    }
}
