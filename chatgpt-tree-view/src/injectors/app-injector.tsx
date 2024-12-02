import React from 'react'
import ReactDOM from 'react-dom/client'

import App from '../components/app'
import parse from '../tree/parser'
import logger from '../logger'
import ConversationResponse from '../models/conversation-response'
import queryMainElement from '../query/main-element'

const getRootDiv = () => {
    const root = document.createElement('div')

    root.id = 'chatgpt-tree-view-root'
    const mainElement = queryMainElement()
    const mainBoundingRect = mainElement.getBoundingClientRect()
    const mainX = mainBoundingRect.x
    const mainY = mainBoundingRect.y
    root.style.position = 'absolute'
    root.style.top = `${mainY}px`
    root.style.left = `${mainX}px`
    root.style.overflow = 'hidden'
    root.style.pointerEvents = 'none'
    root.style.visibility = 'hidden'
    
    // document.body.appendChild(root)

    // setup resize observer so that our root element can resize accordingly
    const documentResizeObserver = new ResizeObserver(() => {
        const mainElement = queryMainElement()
        const mainBoundingRect = mainElement.getBoundingClientRect()
        const mainX = mainBoundingRect.x
        const mainY = mainBoundingRect.y
        const mainWidth = mainBoundingRect.width
        const mainHeight = mainBoundingRect.height
        root.style.top = `${mainY}px`
        root.style.left = `${mainX}px`
        root.style.width = `${mainWidth}px`
        root.style.height = `${mainHeight}px`
    })
    documentResizeObserver.observe(mainElement)

    return root
}

const injectApp = () => {
    const root = getRootDiv()

    const rootDiv = ReactDOM.createRoot(root)
    rootDiv.render(<App />)

    // only append the root div if it doesn't exist
    if (!document.getElementById('chatgpt-tree-view-root')) {
        document.body.appendChild(root)
    }
}

export default injectApp
