const logger = {
    info: (msg) => {
        console.log('[INFO] ChatGPT TreeView: ', msg)
    },
    error: (msg, error) => {
        console.error('[ERROR] ChatGPT TreeView: ', msg, error)
    },
    debug: function () {
        console.log('[DEBUG] ChatGPT TreeView: ', ...arguments)
    },
}

export default logger
