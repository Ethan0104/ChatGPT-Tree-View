'use strict'

import './content.css'

import injectApp from './injectors/app-injector'
import injectEntryButton from './injectors/entry-injector'
import logger from './logger'

// handle the "enter tree view" button
const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        const newNodes = mutation.addedNodes
        for (const node of newNodes) {
            if (node instanceof HTMLElement) {
                if (node.querySelector('[data-testid="profile-button"]')) {
                    injectEntryButton()
                    injectApp()
                }
            }
        }
    }
})

observer.observe(document.body, {
    childList: true,
    subtree: true,
})

// setTimeout(() => {
//     observer.observe(document.body, {
//         childList: true,
//         subtree: true,
//     })
// }, 1000)

// --- Event Listeners (from Background Script) ---
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'render-tree') {
//         const treeResponse = request.treeResponse as ConversationResponse
//         const mapping = treeResponse.mapping
//         const currentNodeId = treeResponse.current_node

//         // initializeTreeSpace(mapping, currentNodeId)
//         initializeTreeSpace(treeResponse)
//     } else if (request.action === 'tree-fetch-failed') {
//         logger.error('Failed to fetch tree', request.error)
//     }
// })
