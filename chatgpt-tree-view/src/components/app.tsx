import React, { useEffect } from 'react'

import { CanvasProvider } from '../providers/canvas-provider'
import Canvas from './canvas'
import { TreeProvider } from '../providers/tree-provider'
import { LayoutProvider } from '../providers/layout-provider'
import TreeContainer from './tree-container'
import HUD from './hud'
import { streamObserverStart } from '../observers/stream-observer'
import logger from '../logger'


const App: React.FC = () => {
    // Set up necessary Observers
    // useEffect(() => {
        // streamObserverStart() // always breaking
    // }, [])


    return (
        <TreeProvider>
            <LayoutProvider>
                {/* everything that's pannable/zoomable goes inside this canvas */}
                <CanvasProvider>
                    <Canvas>
                        <TreeContainer />
                    </Canvas>
                </CanvasProvider>

                {/* static things */}
                <HUD />
            </LayoutProvider>
        </TreeProvider>
    )
}

export default App
