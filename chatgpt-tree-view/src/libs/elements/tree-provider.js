import React, { createContext, useContext, useEffect, useState } from 'react'

import { reingoldTilford } from '../mapping/reingold-tilford'

const TreeContext = createContext()

const TreeProvider = ({ children, convoTree }) => {
    const [positions, setPositions] = useState({})
    const [dimensions, setDimensions] = useState({})

    const blocks = convoTree.getElementsAsList()

    useEffect(() => {
        if (Object.keys(dimensions).length === blocks.length) {
            const newPositions = reingoldTilford(convoTree.roots, dimensions)
            setPositions(newPositions)
        }
    }, [dimensions])

    return (
        <TreeContext.Provider
            value={{ positions, setPositions, dimensions, setDimensions }}
        >
            {children}
        </TreeContext.Provider>
    )
}

const useTreeContext = () => useContext(TreeContext)

export { TreeProvider, useTreeContext }
