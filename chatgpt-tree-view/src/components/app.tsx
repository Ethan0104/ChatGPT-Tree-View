import React, { useEffect, useState } from 'react'

import { CanvasProvider, useCanvasContext } from '../providers/canvas-provider'
import Canvas from './canvas'
import { TreeProvider } from '../providers/tree-provider'
import { LayoutProvider } from '../providers/layout-provider'
import TreeContainer from './tree-container'
import ConvoTree from '../models/convo-tree'
import logger from '../logger'
import ConversationResponse from '../models/conversation-response'
import parse from '../tree/parser'
import showOrHideLinearMessages from '../manipulators/view-switcher'


const App: React.FC = () => {
    const [convoTree, setConvoTree] = useState<ConvoTree | null>(null)
    const [inTreeView, setInTreeView] = useState<boolean>(false)

    // return (
    //     <TreeProvider convoTree={convoTree}>
    //         <LayoutProvider>
    //             {/* everything that's pannable/zoomable goes inside this canvas */}
    //             <CanvasProvider>
    //                 <Canvas>
    //                     <TreeContainer />
    //                 </Canvas>
    //             </CanvasProvider>

    //             {/* static things */}
    //         </LayoutProvider>
    //     </TreeProvider>
    // )

    useEffect(() => {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'render-tree') {
                const treeResponse = request.treeResponse as ConversationResponse
                setConvoTree(parse(treeResponse))
                showOrHideLinearMessages(false)
                setInTreeView(true)
            } else if (request.action === 'tree-fetch-failed') {
                logger.error('Failed to fetch tree', request.error)
            }
        })
    }, [])
    
    return (
        <>
            {
                inTreeView && convoTree && (
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
        </>
    )
}

export default App
