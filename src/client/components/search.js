export function init({ input, autofocus = true }) {
    const btn = input.nextElementSibling ; btn.onclick = verify
    input.addEventListener('keydown', ({ key }) => key == 'Enter' && verify())
    if (autofocus) input.focus()
    function verify() {
        const certNum = input.value.trim()
        if (!certNum) return alert('Please enter a certificate number')
        if (/\D/.test(certNum)) return alert('Certificate number must contain only digits')
        btn.disabled = true ; btn.textContent = 'Retrieving...'
        location.href = `${location.origin}/${certNum}`
    }
    addEventListener('pageshow', () => reset({ input, autofocus }))
}

export function reset({ input, autofocus }) { // and button label
    const btn = input.nextElementSibling ; btn.disabled = false ; btn.textContent = 'Verify Certificate'
    input[(autofocus ?? location.pathname == '/') ? 'focus' : 'blur']()
}
