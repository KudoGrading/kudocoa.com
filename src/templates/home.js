import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'
import * as baseScript from '../scripts/base.js'

export function generate() {
    const pageContent = `
        ${header.generate('')}
        ${footer.generate()}
        <script>${baseScript.generate()}</script>
    `
    return base.generate(
        'Kudo Grading + Authentication', // title
        'Verify certificate authenticity with Kudo Grading & Authentication Services', // descriptiuon
        pageContent,
        'homepage' // class
    )
}
