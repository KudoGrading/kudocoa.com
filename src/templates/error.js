import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

export function generate({ certID, errMsg } = {}) {
    const title = certID ? `Kudo COA #${certID} / Certificate Not Found` : 'System Error'
    const description = certID ? `Certificate # ${certID} not found` : 'System error occurred'
    const errContent = `<div class="error-msg">Certificate # <strong>${certID}</strong> ${ errMsg || 'Error' }.</div>`
    const bodyContent = `
        ${header.generate(certID)}
        ${errContent}
        ${footer.generate()}
    `
    return base.generate({ title, description, bodyContent })
}
