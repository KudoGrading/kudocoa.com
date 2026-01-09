export function generate() {
    return `
        <footer>
            <div>© ${ new Date().getFullYear() } ${app.names.long.toUpperCase()}</div>
            <div class="footer-links">
                <a href="/">Home</a>
                <span class="footer-separator"></span>
                <a href="${app.urls.github}" target="_blank" rel="noopener">GitHub</a>
                <span class="footer-separator"></span>
                <a href="mailto:${app.emails.support}">Contact</a>
            </div>
        </footer>
    `
}
