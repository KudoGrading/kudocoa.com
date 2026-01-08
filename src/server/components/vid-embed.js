export { default as css } from '../../../public/css/components/server/vid-embed.min.css'

export function generate({ vidURL, vidURLs = [] }) {
    const url = vidURL || vidURLs[Math.floor(Math.random() * vidURLs.length)]
    if (!url || !/youtube\.com|youtu\.be/.test(url)) return ''
    const vidID = url.match(/v=([^&]{11})/)?.[1]
    return !vidID ? '' : `
        <div class="vid-embed">
            <div class="vid-container">
                <div class="vid-placeholder">Loading video...</div>
                <iframe 
                    src="https://www.youtube.com/embed/${vidID}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen frameborder="0" loading="lazy"
                    onload="this.previousElementSibling.style.display='none'">
                </iframe>
            </div>
        </div>
    `
}
