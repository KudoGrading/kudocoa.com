export function generate(certData) {
    const ytURL = certData.trailerURL || certData.videoURL || certData.vidURL || certData.youtubeURL || certData.ytURL
    if (!ytURL || !/youtube\.com|youtu\.be/.test(ytURL)) return ''
    const vidID = ytURL.match(
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1]
    return !vidID ? '' : `
        <div class="youtube-embed">
            <div class="video-container">
                <iframe 
                    src="https://www.youtube.com/embed/${vidID}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen frameborder="0" loading="lazy">
                </iframe>
            </div>
        </div>
    `
}
