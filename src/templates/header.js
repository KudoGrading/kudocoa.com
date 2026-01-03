export function generate(certID = '') {
    return `
        <div class="hero">
            <div class="hero-big">KUDO</div>
            <div class="hero-small">GRADING + AUTHENTICATION</div>
        </div>

        <div class="search-bar">
            <input type="number" id="certNum" placeholder="Enter certificate number" autofocus value="${certID}">
            <button class="search-btn" id="verifyBtn">Verify Certificate</button>
        </div>
    `
}
