export function generate() {
    return `
        document.addEventListener('DOMContentLoaded', () => {
            const input = document.getElementById('certNumber'),
                button = document.getElementById('verifyBtn')
            button.onclick = verify
            input.addEventListener('keydown', ({ key }) => key == 'Enter' && verify())
            function verify() {
                const certNumber = input.value.trim()
                if (!certNumber)
                    return alert('Please enter a certificate number')
                if (!/^\\d+$/.test(certNumber))
                    return alert('Certificate number must contain only digits')
                button.disabled = true ; button.textContent = 'Retrieving...'
                location.href = 'https://kudocoa.com/' + certNumber
            }
            input.focus() ; const val = input.value ; input.value = '' ; input.value = val
            addEventListener('pageshow', () => {
                button.disabled = false ; button.textContent = 'Verify Certificate'
                input.focus() ; const val = input.value ; input.value = '' ; input.value = val
            })
        })
    `
}
