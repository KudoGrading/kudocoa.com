import * as certDetailRows from './cert-detail-rows.js'
import * as comicPages from './comic-pages.js'
import * as noteBoxes from './note-boxes.js'
import * as verificationBadge from './verification-badge.js'

export async function generate(certID, certData) {
    return `
        <div class="cert-header">
            <div class="serial-num">CERT. NUMBER: ${certID}</div>
            <div class="header-right">
                <div class="download-section">
                    <div class="download-label">Download:</div>
                    <div class="download-buttons">
                        <button class="download-btn" data-filename="kudo_coa_${certID}.png"
                                data-url="https://cdn.jsdelivr.net/gh/KudoGrading/certificates/coas/${certID}/certificate.png">
                            PNG</button>
                        <button class="download-btn" data-filename="kudo_coa_${certID}.pdf"
                                data-url="https://cdn.jsdelivr.net/gh/KudoGrading/certificates/coas/${certID}/certificate.pdf">
                            PDF</button>
                    </div>
                </div>
                ${verificationBadge.generate(certData)}
            </div>
        </div>

        <div class="cert-body">
            <div class="cert-image" id="certImage"><div class="image-placeholder">Loading image...</div></div>
            <div class="cert-details">${certDetailRows.generate(certID, certData)}</div>
        </div>

        ${noteBoxes.generate(certData)}
        ${ await comicPages.generate(certData) }
    `
}
