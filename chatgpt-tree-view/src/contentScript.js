'use strict'

import { getConversationHistoryRequests } from './libs/network-utils'
import { addTreeButton } from './libs/elements/tree-button'
import { initializeTreeSpace } from './libs/ui-utils'
import { ConvoTree } from './libs/mapping/convo-tree.js'

// // call the function whenever the user double clicks anywhere
// document.addEventListener('dblclick', () => {
//     const requests = getConversationHistoryRequests()
//     console.log(requests)
// })

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
        console.log('rendering tree')

        const treeResponse = request.treeResponse
        const mapping = treeResponse.mapping
        const currentNodeId = treeResponse.current_node
        const tree = new ConvoTree(mapping, currentNodeId)
        tree.printRawTreePreOrder()
        console.log('DRUM ROLL PLEASE')
        tree.printMergedTreePreOrder()

        // initializeTreeSpace(tree)
    }
})
