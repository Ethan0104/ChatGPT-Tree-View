import React from 'react'

import { CanvasProvider, useCanvasContext } from './canvas-provider'
import { Canvas } from './canvas'
import { TreeProvider } from './tree-provider'
import { LayoutProvider } from './layout-provider'
import { TreeContainer } from './tree-container'

const App = ({ convoTree }) => {
    console.log('app is re-rendering')
    return (
        <TreeProvider convoTree={convoTree}>
            <LayoutProvider>
                {/* everything that's pannable/zoomable goes inside this canvas */}
                <CanvasProvider>
                    <Canvas>
                        <TreeContainer />
                    </Canvas>
                </CanvasProvider>

                {/* static things */}
            </LayoutProvider>
        </TreeProvider>
    )
}

export { App }
