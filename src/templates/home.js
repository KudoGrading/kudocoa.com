import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'
import * as homeScript from '../scripts/home.js'

const app = await import('../../data/app.json')

export function generate() {
    const title = app.name
    const description = `Verify certificate authenticity with ${app.fullName}`
    const bodyContent = `
        ${header.generate()}
        ${footer.generate()}
        <script>${homeScript.generate()}</script>
    `
    return base.generate({ title, description, bodyContent, bodyClass: 'homepage' })
}
