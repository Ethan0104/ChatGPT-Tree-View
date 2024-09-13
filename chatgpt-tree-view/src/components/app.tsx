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
import { streamObserverStart } from '../observers/stream-observer'


const App: React.FC = () => {
    const [convoTree, setConvoTree] = useState<ConvoTree | null>(null)
    const [inTreeView, setInTreeView] = useState<boolean>(false)

    // Set up necessary Observers
    useEffect(() => {
        streamObserverStart()
    }, [])

    // Register *chrome* event listener for messages from background script
    useEffect(() => {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'render-tree') {
                const treeResponse = request.treeResponse as ConversationResponse
                const parsedTree = parse(treeResponse)
                logger.info('Parsed tree:', parsedTree)
                setConvoTree(parsedTree)
                showOrHideLinearMessages(false)
                setInTreeView(true)
            } else if (request.action === 'tree-fetch-failed') {
                logger.error('Failed to fetch tree', request.error)
            }
        })
    }, [])

    // Register *local* event listener for messages from observers
    useEffect(() => {
        const handleConvoTreeUpdated = () => {
            logger.info('Assistant message finished, need to request for new tree now...')
        }

        window.addEventListener('assistant-message-finished', handleConvoTreeUpdated)
        return () => {
            window.removeEventListener('assistant-message-finished', handleConvoTreeUpdated)
        }
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
