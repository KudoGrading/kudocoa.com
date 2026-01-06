import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'
import * as certDataRows from '../components/cert-data-rows.js'
import * as comicPages from '../components/comic-pages.js'
import * as noteBoxes from '../components/note-boxes.js'
import * as verifBadge from '../components/verif-badge.js'
import * as vidEmbed from '../components/vid-embed.js'
import bttCSS from '../styles/css/back-to-top.min.css'
import certCSS from '../styles/css/cert.min.css'
import navArrowsCSS from '../styles/css/nav-arrows.min.css'

const app = await import('../../../public/data/app.json')

export async function generate({ certID, certData, devMode, debugMode }) {
    app.urls.assetHost.app = devMode ? 'http://localhost:8888/assets' : app.urls.assetHost.app
    certData = typeof certData == 'string' ? JSON.parse(certData) : certData
    const vidURL = certData.trailerURL || certData.videoURL || certData.vidURL || certData.youtubeURL || certData.ytURL
    const { vidURLs } = certData
    const vidEmbedOptions = vidURLs ? { vidURLs } : vidURL ? { vidURL } : null
    const itemYearMatch = (certData.coverDate || certData.publishDate)?.match(/\d{4}/)
    const itemYear = itemYearMatch ? ` (${itemYearMatch[0]})` : ''
    const title = `${ certID ? `${app.names.short} #${certID} / ` : '' }${
                      certData.item || '' }${itemYear} / ${app.names.medium}`
    const description = `Certificate # ${certID} verified by ${app.names.long}`
    const bodyContent = `
        ${header.generate(certID)}
        <div class="cert-header">
            <div class="cert-num">CERT. NUMBER: ${certID}</div>
            <div class="cert-header-right">
                <div class="download-section">
                    <div class="download-label">Download:</div>
                    <div class="download-btns">
                        <button class="download-btn" data-filename="kudo_coa_#${certID}.png"
                                data-url="${app.urls.assetHost.cert}/coas/${certID}/certificate.png">
                            PNG</button>
                        <button class="download-btn" data-filename="kudo_coa_#${certID}.pdf"
                                data-url="${app.urls.assetHost.cert}/coas/${certID}/certificate.pdf">
                            PDF</button>
                    </div>
                </div>
                ${verifBadge.generate(certData)}
            </div>
        </div>
        <div class="cert-body">
            <div class="item-shot" id="certImg"><div class="item-placeholder">Loading image...</div></div>
            <div class="cert-details">${certDataRows.generate({ certID, certData })}</div>
        </div>
        ${ noteBoxes.generate(certData) }
        ${ vidEmbedOptions ? vidEmbed.generate(vidEmbedOptions) : '' }
        ${ certData.interiorURL ? await comicPages.generate({ srcURL: certData.interiorURL, debugMode }) : '' }
        ${ footer.generate() }
        <script type="module">
            import { initCertPage } from '${app.urls.assetHost.app}/js/pages/cert/index.min.js'
            initCertPage()
        </script>
    `
    return base.generate({
        title, description, bodyContent, debugMode,
        css:
            bttCSS + certCSS + navArrowsCSS // client components
          + certDataRows.css + comicPages.css + noteBoxes.css + verifBadge.css + vidEmbed.css // server components
    })
}
