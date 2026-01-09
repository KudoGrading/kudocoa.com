export function create({ type, certData }) {
    if (type == 'html') return { 'Content-Type': 'text/html' }
    else if (type == 'cache') {
        const { config } = globalThis,
              hasVideo = /\\"(?:trailer|vide?o?|youtube|yt)URLs\\"/.test(JSON.stringify(certData))
        return { 'Cache-Control':
            (config.cacheDuration == 'auto' && hasVideo || config.cacheDuration == 0) ?
                'no-store, must-revalidate' : `public, max-age=${
                    config.cacheDuration == 'auto' ? 21600 /* 6h */ : config.cacheDuration || 0 }`
        }
    } else return console.error(`createHeaders() 'type' arg must be <cache|html>`)
}
