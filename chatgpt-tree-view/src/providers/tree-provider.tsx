import React, { createContext, useContext, ReactNode } from 'react'

import ConvoTree from '../models/convo-tree'

interface TreeContextValue {
    convoTree: ConvoTree
    setConvoTree: React.Dispatch<React.SetStateAction<ConvoTree | null>>
}

// Create the context with an initial default value (can be null)
const TreeContext = createContext<TreeContextValue | undefined>(undefined)

// Define the props for the TreeProvider component
interface TreeProviderProps {
    convoTree: ConvoTree
    setConvoTree: React.Dispatch<React.SetStateAction<ConvoTree | null>>
    children: ReactNode
}

// TreeProvider component
const TreeProvider: React.FC<TreeProviderProps> = ({ convoTree, setConvoTree, children }) => {
    return (
        <TreeContext.Provider value={{ convoTree, setConvoTree }}>
            {children}
        </TreeContext.Provider>
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
