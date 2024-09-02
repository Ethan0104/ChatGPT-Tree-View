const logger = {
    info: function () {
        console.log('[INFO] ChatGPT TreeView: ', ...arguments)
    },
    error: (msg, error) => {
        console.error('[ERROR] ChatGPT TreeView: ', msg, error)
    },
    debug: function () {
        console.log('[DEBUG] ChatGPT TreeView: ', ...arguments)
    },
}

export default logger
