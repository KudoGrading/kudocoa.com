export function init({ input, focus = true }) {
    const btn = input.nextElementSibling ; btn.onclick = () => verify()
    input.addEventListener('keydown', ({ key }) => key == 'Enter' && verify())
    if (focus) input.focus()
    function verify() {
        const certNum = input.value.trim()
        if (!certNum) return alert('Please enter a certificate number')
        if (/\D/.test(certNum)) return alert('Certificate number must contain only digits')
        btn.disabled = true ; btn.textContent = 'Retrieving...'
        location.href = `${location.origin}/${certNum}`
    }
}

export function reset({ input }) {
    const btn = input.nextElementSibling ; btn.disabled = false ; btn.textContent = 'Verify Certificate'
    input[location.pathname == '/' ? 'focus' : 'blur']()
}
