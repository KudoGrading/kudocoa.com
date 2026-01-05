export function init({ input, btn, baseURL, focus = true }) {
    btn.onclick = () => verify({ input, btn, baseURL })
    input.addEventListener('keydown', ({ key }) => key == 'Enter' && verify({ input, btn, baseURL }))
    if (focus) input.focus()
    function verify({ input, btn, baseURL }) {
        const certNum = input.value.trim()
        if (!certNum) return alert('Please enter a certificate number')
        if (/\D/.test(certNum)) return alert('Certificate number must contain only digits')
        btn.disabled = true ; btn.textContent = 'Retrieving...'
        location.href = `${baseURL}/${certNum}`
    }
}

export function reset({ input, btn }) {
    btn.disabled = false ; btn.textContent = 'Verify Certificate' ; input[location.pathname == '/' ? 'focus' : 'blur']()
}
