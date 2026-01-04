import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

const app = await import('../../../data/app.json')

export function generate({ certID, errMsg = 'Error', status = 404 } = {}) {
    const title = `${ certID ? `Kudo COA #${certID} / Certificate Not Found` : 'System Error' } / ${app.name}`
    const description = certID ? `Certificate # ${certID} not found` : 'System error occurred'
    const bodyContent = `
        ${header.generate(certID)}
        <div class="error-msg">
            <div class="status-code">${status}</div>
            <p>${ certID ? `Certificate # <strong>${certID}</strong> — ` : '' }${errMsg}</p>
        </div>
        ${footer.generate()}
    `
    return base.generate({ title, description, bodyContent })
}
