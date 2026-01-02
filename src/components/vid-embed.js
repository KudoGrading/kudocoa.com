export function generate(vidURL) {
    if (!vidURL || !/youtube\.com|youtu\.be/.test(vidURL)) return ''
    const vidID = vidURL.match(
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
