export function verify(input, button, baseURL) {
    const certNum = input.value.trim()
    if (!certNum) return alert('Please enter a certificate number')
    if (!/^\d+$/.test(certNum)) return alert('Certificate number must contain only digits')
    button.disabled = true ; button.textContent = 'Retrieving...'
    location.href = `${baseURL}/${certNum}`
}

export function initSearch(input, button, baseURL) {
    button.onclick = () => verify(input, button, baseURL)
    input.addEventListener('keydown', ({ key }) => {
        if (key == 'Enter') verify(input, button, baseURL) })
}
