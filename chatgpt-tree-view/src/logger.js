const logger = {
    info: function () {
        console.log('[INFO] ChatGPT TreeView: ', ...arguments)
    },
    error: function () {
        console.error('[ERROR] ChatGPT TreeView: ', ...arguments)
    },
    debug: function () {
        console.log('[DEBUG] ChatGPT TreeView: ', ...arguments)
    },
}

export default logger
