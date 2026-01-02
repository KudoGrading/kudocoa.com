export function generate({ vidURL, vidURLs } = {}) {
    const url = vidURL || (Array.isArray(vidURLs) && vidURLs[Math.floor(Math.random() * vidURLs.length)])
    if (!url || !/youtube\.com|youtu\.be/.test(url)) return ''
    const vidID = url.match(
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1]
    return !vidID ? '' : `
        <div class="vid-embed">
            <div class="vid-container">
                <iframe 
                    src="https://www.youtube.com/embed/${vidID}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen frameborder="0" loading="lazy">
                </iframe>
            </div>
        </div>
    `
}
