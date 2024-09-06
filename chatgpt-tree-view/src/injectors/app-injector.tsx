import React from 'react'
import ReactDOM from 'react-dom/client'

import App from '../components/app'
import parse from '../tree/parser'
import logger from '../logger'
import ConversationResponse from '../models/conversation-response'

const primeExistingUI = () => {
    // hide all the conversation turns
    const convoTurns = document.querySelectorAll(
        "[data-testid^='conversation-turn-']"
    )
    convoTurns.forEach((turn) => {
        (turn as HTMLElement).style.display = 'none'
    })

    // modify the parent div that will eventually hold the entire tree view
    const convoTurnParent = convoTurns[0].parentNode as HTMLElement
    convoTurnParent.classList.add('h-full')

    // initialize the actual tree view by creating an root element that's on the same level as the conversation turns
    const root = document.createElement('div')
    root.id = 'chatgpt-tree-view-root'
    root.classList.add('h-full', 'flex-grow')
    convoTurnParent.appendChild(root)

    return root
}

const initializeTreeSpace = (treeResponse: ConversationResponse) => {
    // get the root div that's obtained by priming the existing ChatGPT UI
    const root = primeExistingUI()

    // initialize the tree
    const convoTree = parse(treeResponse)
    logger.info('ConvoTree:', convoTree)

    const rootDiv = ReactDOM.createRoot(root)
    rootDiv.render(<App convoTree={convoTree} />)
}

export default initializeTreeSpace
