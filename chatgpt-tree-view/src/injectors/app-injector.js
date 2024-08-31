import React from 'react'
import ReactDOM from 'react-dom/client'

import App from '../components/app'
import ConvoTree from '../mapping/convo-tree'

const primeExistingUI = () => {
    // hide all the conversation turns
    const convoTurns = document.querySelectorAll(
        "[data-testid^='conversation-turn-']"
    )
    convoTurns.forEach((turn) => {
        turn.style.display = 'none'
    })

    // modify the parent div that will eventually hold the entire tree view
    const convoTurnParent = convoTurns[0].parentNode
    convoTurnParent.classList.add('h-full')

    // initialize the actual tree view by creating an root element that's on the same level as the conversation turns
    const root = document.createElement('div')
    root.id = 'chatgpt-tree-view-root'
    root.classList.add('h-full', 'flex-grow')
    convoTurnParent.appendChild(root)

    return root
}

const initializeTreeSpace = (mapping, currentNodeId) => {
    // get the root div that's obtained by priming the existing ChatGPT UI
    const root = primeExistingUI()

    // initialize the tree
    const convoTree = new ConvoTree(mapping, currentNodeId)

    const rootDiv = ReactDOM.createRoot(root)
    rootDiv.render(<App convoTree={convoTree} />)
}

export default initializeTreeSpace