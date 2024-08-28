import React from 'react'

import { CanvasProvider, useCanvasContext } from './canvas-provider'
import { Canvas } from './canvas'
import { TreeProvider } from './tree-provider'
import { TreeContainer } from './tree-container'

const App = ({ convoTree }) => {
    console.log('convoTree', convoTree)

    return (
        <TreeProvider convoTree={convoTree}>
            {/* everything that's pannable/zoomable goes inside this canvas */}
            <CanvasProvider>
                <Canvas>
                    <TreeContainer convoTree={convoTree} />
                </Canvas>
            </CanvasProvider>

            {/* static things */}
        </TreeProvider>
    )
}

export { App }
