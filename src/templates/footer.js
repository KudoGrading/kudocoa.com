export function generate() {
    return `
        <footer>
            <div>© ${ new Date().getFullYear() } KUDO GRADING & AUTHENTICATION SERVICES</div>
            <div class="footer-links">
                <a href="https://www.kudocoa.com">Home</a>
                <span class="footer-separator"></span>
                <a href="https://github.com/KudoGrading" target="_blank" rel="noopener">GitHub</a>
                <span class="footer-separator"></span>
                <a href="mailto:support@kudocoa.com">Contact</a>
            </div>
        </footer>
    `
}
