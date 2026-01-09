function minify(html) {

    // Extract scripts to preserve from minification
    const scriptsToPreserve = [], scriptRegex = /<script\b[^>]*>[\s\S]+?<\/script>/gi
    let match
    while ((match = scriptRegex.exec(html)) != null) scriptsToPreserve.push(match[0])

    // Temp replace scripts w/ placeholders
    let tempHTML = html
    scriptsToPreserve.forEach((script, idx) =>
        tempHTML = tempHTML.replace(script, `<!-- SCRIPT_PLACEHOLDER_${idx} -->`))

    // Minify remaining HTML
    const minifiedHTML = tempHTML
        .replace(/\s+/g, ' ') // replace multi-spaces w/ single space
        .replace(/>\s+</g, '><') // remove spaces between tags
        .trim() // trim leading/trailing whitespace

    // Restore scripts
    let finalHTML = minifiedHTML
    scriptsToPreserve.forEach((script, idx) =>
        finalHTML = finalHTML.replace(`<!-- SCRIPT_PLACEHOLDER_${idx} -->`, script))

    return finalHTML
}

export function process({ html, devMode }) { // based on config
    const toMinify = config.minifyHTML == 'auto' ? !devMode : !!config.minifyHTML
    return toMinify ? minify(html) : html
}
