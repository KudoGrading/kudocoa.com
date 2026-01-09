export const config = {
    env: { dev: { ip: 'localhost', port: 8888 }},
    cacheDuration: 0, // int (secs) or 'auto' (6h if non-video page, 0s otherwise)
    minifyHTML: 'auto' // <true|false> or 'auto' (false if dev mode)
}
