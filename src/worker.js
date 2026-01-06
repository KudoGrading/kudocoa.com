const config = {
    minifyHTML: 'auto', // <true|false> or 'auto'
    staticCacheTime: 21600, // 6h
    videoCacheTime: 5 // sec
}

export default {
    async fetch(req, env) {
        const url = new URL(req.url),
              htmlHeaders = { 'Content-Type': 'text/html' },
              devMode = env.ENVIRONMENT == 'development',
              baseURL = devMode ? 'http://localhost:8888' : url.origin
        config.minifyHTML = config.minifyHTML == 'auto' ? !devMode : config.minifyHTML

        if (/^\/assets\/?$/.test(url.pathname)) // redir assets index to homepage
            return Response.redirect(`${baseURL}/`, 302)

        else if (url.pathname.startsWith('/assets/')) { // serve public/ asset
            const assetPath = url.pathname.replace('/assets', '').replace(/(?<!\.min)\.js$/i, '.min.js'),
                  resp = await env.ASSETS.fetch(new Request(new URL(assetPath, req.url), req)),
                  fileExt = url.pathname.split('.').pop().toLowerCase(),
                  contentType = (await import('../public/data/mime-types.json'))[fileExt] || 'application/octet-stream'
            return new Response(resp.body, {
                status: resp.status, headers: { 'Content-Type': contentType, ...Object.fromEntries(resp.headers) }})

        } else if (url.pathname == '/') { // render homepage
            const homepage = await import('./server/templates/home.js')
            return new Response(await processHTML(homepage.generate(devMode)), { headers: htmlHeaders })
        }

        // Validate cert #
        const certInput = url.pathname.split('/')[1],
              errPage = await import('./server/templates/error.js')
        if (/\D/.test(certInput)) // 400
            return new Response(await processHTML(errPage.generate({
                certID: certInput, errMsg: 'Invalid certificate ID (numbers only!)', status: 400, devMode })), {
                    headers: htmlHeaders, status: 400 })
        const certID = certInput.padStart(10, '0')
        if (certID.length > 10) // 400
            return new Response(await processHTML(errPage.generate({
                certID, errMsg: 'Certificate ID too long (max 10 digits!)', status: 400, devMode })), {
                    headers: htmlHeaders, status: 400 })
        if (certInput != certID) // 301 redir e.g. /1 to /0000000001
            return Response.redirect(`${baseURL}/${certID}`, 301)

        // Render cert page
        try {
            const certData = await env.COAS_KV.get(certID)
            if (!certData)
                return new Response(await processHTML(errPage.generate({
                    certID, errMsg: 'Not found', status: 404, devMode })), {
                        headers: htmlHeaders, status: 404 })
            const certPage = await import('./server/templates/cert.js')
            const hasVideo = /(?:trailer|vide?o?|youtube|yt)URLs?/.test(JSON.stringify(certData))
            const cacheHeaders = { // shorter for video pages to allow rotation
                'Cache-Control': `public, max-age=${config[`${ hasVideo ? 'video' : 'static' }CacheTime`]}` }
            return new Response(await processHTML(await certPage.generate({
                certID, certData, devMode })), { headers: { ...htmlHeaders, ...cacheHeaders }})
        } catch (err) {
            return new Response(await processHTML(errPage.generate({
                errMsg: 'System error: ' + err.message, status: 500, devMode })), { headers: htmlHeaders, status: 500 })
        }

        async function processHTML(html) {
            return config.minifyHTML ? (await import('./server/lib/html.js')).minify(html) : html }
    }
}
