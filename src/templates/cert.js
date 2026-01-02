import * as string from '../lib/string.js'
import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'
import * as certContent from '../components/cert-content.js'
import * as certScript from '../scripts/cert.js'

export async function generate(certID, certData) {
    const pageContent = `
        ${header.generate(certID)}
        ${ await certContent.generate(certID, certData) }
        ${footer.generate()}
        <script>${certScript.generate(certID)}</script>
    `
    return base.generate(
        string.generatePageTitle(certID, certData),
        `Certificate # ${certID} verified by Kudo Grading & Authentication Services`, // description
        pageContent
    )
}
