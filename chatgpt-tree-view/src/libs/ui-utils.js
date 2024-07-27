import React from 'react'
import ReactDOM from 'react-dom/client'

import { Canvas } from './elements/canvas'

function initializeTreeSpace(tree) {
    // hide all the conversation turns
    const convoTurns = document.querySelectorAll(
        "[data-testid^='conversation-turn-']"
    )
    console.log('TURNS', convoTurns)
    convoTurns.forEach((turn) => {
        turn.style.display = 'none'
    })

    // modify the parent div that will eventually hold the entire tree view
    const convoTurnParent = convoTurns[0].parentNode
    convoTurnParent.classList.add('h-full')

    // TEST
    let child1 = tree.roots[0]
    let child2 = tree.roots[0].children[0]
    console.log('CHILD1', child1)
    console.log('CHILD2', child2)

    // initialize the actual tree view by creating an root element that's on the same level as the conversation turns
    const root = document.createElement('div')
    root.id = 'chatgpt-tree-view-root'
    root.classList.add('h-full', 'flex-grow')
    convoTurnParent.appendChild(root)

    const rootDiv = ReactDOM.createRoot(root)
    // const mainDiv = (
    //     <div>
    //         {child1.element}
    //         {child2.element}
    //     </div>
    // )
    // const mainDiv = (
    //     <>
    //         <Canvas child1={child1.element} child2={child2.element} />
    //     </>
    // )
    // rootDiv.render(mainDiv)
    rootDiv.render(<Canvas child1={child1.element} child2={child2.element} />)
}

export { initializeTreeSpace }
