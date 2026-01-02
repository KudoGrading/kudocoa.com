import css from '../styles/css/global.min.css'

export function generate({ title, description, bodyContent, bodyClass } = {}) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${ title || 'Untitled page' }</title>
            <meta name="description" content="${ description || '' }">
            <style>${css}</style>
            <link rel="icon" type="image/x-icon" href="https://kudoai.com/assets/images/icons/kudoai/favicon.ico">
        </head>
        <body${ bodyClass ? ` class="${bodyClass}"` : '' }>
            <div class="container">${ bodyContent || '' }</div>
        </body>
        </html>
    `
}
