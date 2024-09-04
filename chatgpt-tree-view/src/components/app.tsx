import React from 'react'

import { CanvasProvider, useCanvasContext } from '../providers/canvas-provider'
import Canvas from './canvas'
import { TreeProvider } from '../providers/tree-provider'
import { LayoutProvider } from '../providers/layout-provider'
import TreeContainer from './tree-container'
import ConvoTree from '../models/convo-tree'

interface AppProps {
    convoTree: ConvoTree
}

const App: React.FC<AppProps> = ({ convoTree }) => {
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
