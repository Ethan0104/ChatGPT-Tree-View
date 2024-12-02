'use strict'

import './content.css'

import injectApp from './injectors/app-injector'
import injectEntryButton from './injectors/entry-injector'

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
