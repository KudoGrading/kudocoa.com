import { generatePageTitle } from '../lib/string.js'
import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'
import * as certDataRows from '../components/cert-data-rows.js'
import * as comicPages from '../components/comic-pages.js'
import * as noteBoxes from '../components/note-boxes.js'
import * as verificationBadge from '../components/verification-badge.js'
import * as vidEmbed from '../components/vid-embed.js'
import * as certScript from '../scripts/cert.js'

export async function generate({ certID, certData }) {
    certData = typeof certData == 'string' ? JSON.parse(certData) : certData
    const vidURL = certData.trailerURL || certData.videoURL || certData.vidURL || certData.youtubeURL || certData.ytURL
    const vidURLs = certData.vidURLs
    const vidEmbedOptions = vidURLs ? { vidURLs } : vidURL ? { vidURL } : null
    const title = generatePageTitle({ certID, certData })
    const description = `Certificate # ${certID} verified by Kudo Grading & Authentication Services`
    const bodyContent = `
        ${header.generate(certID)}
        <div class="cert-header">
            <div class="cert-num">CERT. NUMBER: ${certID}</div>
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
            <div class="item-shot" id="certImage"><div class="img-placeholder">Loading image...</div></div>
            <div class="cert-details">${certDataRows.generate({ certID, certData })}</div>
        </div>
        ${ noteBoxes.generate(certData) }
        ${ vidEmbedOptions ? vidEmbed.generate(vidEmbedOptions) : '' }
        ${ certData.interiorURL ? await comicPages.generate(certData.interiorURL) : '' }
        ${ footer.generate() }
        <script>${certScript.generate(certID)}</script>
    `
    return base.generate({ title, description, bodyContent })
}
