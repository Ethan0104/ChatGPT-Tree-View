'use strict'

import './content.css'

import { addTreeButton } from './libs/elements/tree-button'
import { initializeTreeSpace } from './libs/ui-utils'
import logger from './libs/logger'

// handle the "enter tree view" button
addTreeButton()
const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
            const buttonAdded = addTreeButton()
            if (buttonAdded) {
                break
            }
        }
    }
})

setTimeout(() => {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    })
}, 1000)

// --- Event Listeners (from Background Script) ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'render-tree') {
        const treeResponse = request.treeResponse
        const mapping = treeResponse.mapping
        const currentNodeId = treeResponse.current_node

        initializeTreeSpace(mapping, currentNodeId)
    } else if (request.action === 'tree-fetch-failed') {
        logger.error('Failed to fetch tree', request.error)
    }
})
