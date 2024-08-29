import React, { createContext, useContext } from 'react'

const TreeContext = createContext()

const TreeProvider = ({ convoTree, children }) => {
    return (
        <TreeContext.Provider value={{ convoTree }}>
            {children}
        </TreeContext.Provider>
    )
}

const useTreeContext = () => useContext(TreeContext)

export { TreeProvider, useTreeContext }