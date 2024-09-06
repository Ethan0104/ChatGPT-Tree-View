const logger = {
    info: function (...args: any[]) {
        console.log('[INFO] ChatGPT TreeView: ', ...arguments)
    },
    error: function (...args: any[]) {
        console.error('[ERROR] ChatGPT TreeView: ', ...arguments)
    },
    debug: function (...args: any[]) {
        console.log('[DEBUG] ChatGPT TreeView: ', ...arguments)
    },
}

export default logger
