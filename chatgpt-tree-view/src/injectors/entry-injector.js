import React from 'react'
import { createRoot } from 'react-dom/client'

import logger from '../logger'
import TreeButton from '../components/tree-button'

const getTopRight2ButtonsFlexboxDiv = () => {
    try {
        // XYZ - prone to change
        const largeViewDiv = document.querySelector(
            '[data-testid="profile-button"]'
        )?.parentNode

        const newChatButtons = document.querySelectorAll(
            'button[aria-label="New chat"]'
        )
        // pick the newChatButton with the higher x position
        let newChatButton = null
        newChatButtons.forEach((button) => {
            if (!newChatButton) {
                newChatButton = button
            } else {
                if (
                    button.getBoundingClientRect().x >
                    newChatButton.getBoundingClientRect().x
                ) {
                    newChatButton = button
                }
            }
        })
        // set newChatButton to null if its x position is less than half of the viewport width
        if (
            newChatButton &&
            newChatButton.getBoundingClientRect().x < window.innerWidth / 2
        ) {
            newChatButton = null
        }
        const smallViewDiv = newChatButton?.parentNode?.parentNode
        return largeViewDiv || smallViewDiv
    } catch (e) {
        return null
    }
}

const checkIfTreeButtonExists = () => {
    return !!document.getElementById('chatgpt-tree-view-enter-button')
}

const injectEntryButton = async () => {
    const topRight2ButtonsFlexboxDiv = getTopRight2ButtonsFlexboxDiv()
    if (!topRight2ButtonsFlexboxDiv) {
        // wait a bit and try again, avoid running this function too frequently
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return
    }
    if (checkIfTreeButtonExists()) {
        return
    }
    const treeButtonContainer = document.createElement('div')
    topRight2ButtonsFlexboxDiv.insertBefore(
        treeButtonContainer,
        topRight2ButtonsFlexboxDiv.firstChild
    )
    const treeButtonRoot = createRoot(treeButtonContainer)
    treeButtonRoot.render(<TreeButton />)
}

export default injectEntryButton
