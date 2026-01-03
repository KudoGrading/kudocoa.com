const site = await import('../../data/site.json')

export function generate() {
    return `
        document.addEventListener('DOMContentLoaded', () => {
            const input = document.getElementById('certNum'),
                  button = document.getElementById('verifyBtn')
            button.onclick = verify
            input.addEventListener('keydown', ({ key }) => key == 'Enter' && verify())
            function verify() {
                const certNum = input.value.trim()
                if (!certNum)
                    return alert('Please enter a certificate number')
                if (!/^\\d+$/.test(certNum))
                    return alert('Certificate number must contain only digits')
                button.disabled = true ; button.textContent = 'Retrieving...'
                location.href = '${site.urls.home}/' + certNum
            }
            input.focus() ; const val = input.value ; input.value = '' ; input.value = val
            addEventListener('pageshow', () => {
                button.disabled = false ; button.textContent = 'Verify Certificate'
                input.focus() ; const val = input.value ; input.value = '' ; input.value = val
            })
        })
    `
}
