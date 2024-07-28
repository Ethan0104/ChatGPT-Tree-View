import React from 'react'

import { Canvas } from './canvas'
import { TreeProvider } from './tree-provider'

const App = ({ convoTree }) => {
    console.log('convoTree', convoTree)
    const blocks = convoTree.getElementsAsList()

    return (
        <TreeProvider convoTree={convoTree}>
            <Canvas blocks={blocks} />
        </TreeProvider>
    )
}

export { App }
