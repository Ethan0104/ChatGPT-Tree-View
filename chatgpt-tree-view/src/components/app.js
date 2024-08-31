import React from 'react'

import { CanvasProvider, useCanvasContext } from '../providers/canvas-provider'
import Canvas from './canvas'
import { TreeProvider } from '../providers/tree-provider'
import { LayoutProvider } from '../providers/layout-provider'
import TreeContainer from './tree-container'

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

export default App
