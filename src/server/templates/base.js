import globalCSS from '../../../public/css/global.min.css'

export function generate({ title = 'Untitled page', description = '', bodyContent = '', bodyClass, css = '' } = {}) {
    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-E45MKWKPC9"></script>
                <script>
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date()); gtag('config', 'G-E45MKWKPC9');
                </script>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <meta name="description" content="${description}">
                <style>${globalCSS}</style>
                ${ css ? `<style>${css}</style>` : '' }
                <link rel="icon" type="image/x-icon" href="https://kudoai.com/assets/images/icons/kudoai/favicon.ico">
            </head>
            <body${ bodyClass ? ` class="${bodyClass}"` : '' }>
                <div class="container">${bodyContent}</div>
            </body>
        </html>
    `
}
