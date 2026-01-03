import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'
import * as certDataRows from '../components/cert-data-rows.js'
import * as comicPages from '../components/comic-pages.js'
import * as noteBoxes from '../components/note-boxes.js'
import * as verificationBadge from '../components/verification-badge.js'
import * as vidEmbed from '../components/vid-embed.js'
import * as navArrows from '../components/nav-arrows.js'

const app = await import('../../../data/app.json')

export async function generate({ certID, certData }) {
    certData = typeof certData == 'string' ? JSON.parse(certData) : certData
    const vidURL = certData.trailerURL || certData.videoURL || certData.vidURL || certData.youtubeURL || certData.ytURL
    const { vidURLs } = certData
    const vidEmbedOptions = vidURLs ? { vidURLs } : vidURL ? { vidURL } : null
    const itemYearMatch = (certData?.coverDate || certData?.publishDate)?.match(/\d{4}/)
    const itemYear = itemYearMatch ? ` (${itemYearMatch[0]})` : ''
    const title = `${ certID ? `Kudo COA #${parseInt(certID)} / ` : '' }${
                      certData?.item || '' }${itemYear} / ${app.name}`
    const description = `Certificate # ${certID} verified by ${app.fullName}`
    const { navArrowsHTML, prevCertNum, nextCertNum } = navArrows.generate(certID)
    const bodyContent = `
        ${header.generate(certID)}
        <div class="cert-header">
            <div class="cert-num">CERT. NUMBER: ${certID}</div>
            <div class="header-right">
                <div class="download-section">
                    <div class="download-label">Download:</div>
                    <div class="download-buttons">
                        <button class="download-btn" data-filename="kudo_coa_${certID}.png"
                                data-url="${app.urls.jsdelivr}/certificates/coas/${certID}/certificate.png">
                            PNG</button>
                        <button class="download-btn" data-filename="kudo_coa_${certID}.pdf"
                                data-url="${app.urls.jsdelivr}/certificates/coas/${certID}/certificate.pdf">
                            PDF</button>
                    </div>
                </div>
                ${verificationBadge.generate(certData)}
            </div>
        </div>
        <div class="cert-body">
            <div class="item-shot" id="certImage"><div class="item-placeholder">Loading image...</div></div>
            <div class="cert-details">${certDataRows.generate({ certID, certData })}</div>
        </div>
        ${ noteBoxes.generate(certData) }
        ${ vidEmbedOptions ? vidEmbed.generate(vidEmbedOptions) : '' }
        ${ certData.interiorURL ? await comicPages.generate(certData.interiorURL) : '' }
        ${ footer.generate() }
        
        <!-- Inject config and load frontend module -->
        <script type="module">
            import { initCertPage } from '${app.urls.jsdelivr}/kudocoa.com/src/client/pages/cert.js'
            initCertPage(${JSON.stringify({
                certID: certID,
                baseUrl: app.urls.web,
                urls: app.urls,
                navArrowsHTML: navArrowsHTML,
                prevCertNum: prevCertNum || '',
                nextCertNum: nextCertNum
            })})
        </script>
    `
    return base.generate({ title, description, bodyContent })
}
