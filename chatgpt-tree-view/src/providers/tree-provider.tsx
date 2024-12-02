import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'

import ConvoTree from '../models/convo-tree'
import parse from '../tree/parser'
import ConversationResponse from '../models/conversation-response'
import { closeTreeView, toTreeView } from '../manipulators/view-switcher'
import logger from '../logger'

interface TreeContextValue {
    convoTree: ConvoTree
}

// Create the context with an initial default value (can be null)
const TreeContext = createContext<TreeContextValue | undefined>(undefined)

// Define the props for the TreeProvider component
interface TreeProviderProps {
    children: ReactNode
}

// TreeProvider component
const TreeProvider: React.FC<TreeProviderProps> = ({ children }) => {
    const [convoTree, setConvoTree] = useState<ConvoTree | null>(null)
    const [convoTreeStale, setConvoTreeStale] = useState<boolean>(true) // TODO: use this

    useEffect(() => {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'register-updated-tree') {
                const treeResponse = request.treeResponse as ConversationResponse
                const parsedTree = parse(treeResponse)
                logger.info('Fetched tree', parsedTree)
                setConvoTree(parsedTree)
                setConvoTreeStale(false)
                toTreeView()
            } else if (request.action === 'tree-fetch-failed') {
                logger.error('Failed to fetch tree', request.error)
            }
        })
    }, [])

    useEffect(() => {
        const handleShowApp = () => {
            if (convoTree && !convoTreeStale) {
                toTreeView()
            } else {
                chrome.runtime.sendMessage({ action: 'request-tree' })
            }
        }

        window.addEventListener('show-app', handleShowApp)
        return () => {
            window.removeEventListener('show-app', handleShowApp)
        }
    }, [convoTree, convoTreeStale])

    return (
        convoTree && (
            <TreeContext.Provider value={{ convoTree }}>
                {children}
            </TreeContext.Provider>
        )
    )
}

// Custom hook to use the TreeContext
const useTreeContext = (): TreeContextValue => {
    const context = useContext(TreeContext)
    if (context === undefined) {
        throw new Error('useTreeContext must be used within a TreeProvider')
    }
    return context
}

export { TreeProvider, useTreeContext }
