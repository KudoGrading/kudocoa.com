export function createLogger({ prefix = '', debugMode = false }) {
    return {
        debug: (...args) => {
            if (!debugMode) return
            console.log(prefix ? `${prefix} >>` : '[DEBUG]', ...args)
        },
        error: (...args) => {
            console.error(prefix ? `${prefix} ERROR:` : '[ERROR]', ...args)
        }
    }
}
