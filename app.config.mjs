export default {
    env: { dev: { ip: 'localhost', port: 8888 }},
    cacheDuration: 0, // int (secs) or 'auto' (0s if video page, 6h otherwise)
    minifyHTML: 'auto' // <true|false> or 'auto' (false if dev mode)
}
