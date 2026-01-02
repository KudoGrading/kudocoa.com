import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'
import * as baseScript from '../scripts/base.js'

export function generate() {
    const title = 'Kudo Grading + Authentication'
    const description = 'Verify certificate authenticity with Kudo Grading & Authentication Services'
    const bodyContent = `
        ${header.generate()}
        ${footer.generate()}
        <script>${baseScript.generate()}</script>
    `
    return base.generate({ title, description, bodyContent, bodyClass: 'homepage' })
}
