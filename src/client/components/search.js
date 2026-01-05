export function verify({ input, btn, baseURL }) {
    const certNum = input.value.trim()
    if (!certNum) return alert('Please enter a certificate number')
    if (!/^\d+$/.test(certNum)) return alert('Certificate number must contain only digits')
    btn.disabled = true ; btn.textContent = 'Retrieving...'
    location.href = `${baseURL}/${certNum}`
}

export function initSearch({ input, btn, baseURL }) {
    btn.onclick = () => verify({ input, btn, baseURL })
    input.addEventListener('keydown', ({ key }) => {
        if (key == 'Enter') verify({ input, btn, baseURL }) })
}
