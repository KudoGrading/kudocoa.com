import * as base from './base.js'
import * as header from './header.js'
import * as footer from './footer.js'

export function generate({ certID, errMsg = 'Error' } = {}) {
    const title = ( certID ? `Kudo COA #${certID} / Certificate Not Found` : 'System Error' )
                + ' / Kudo Grading + Authentication'
    const description = certID ? `Certificate # ${certID} not found` : 'System error occurred'
    const bodyContent = `
        ${header.generate(certID)}
        <div class="error-msg">
            ${ certID ? `Certificate # <strong>${certID}</strong> — ` : '' }${errMsg}
        </div>
        ${footer.generate()}
    `
    return base.generate({ title, description, bodyContent })
}
