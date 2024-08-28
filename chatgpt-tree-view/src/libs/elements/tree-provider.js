import React, { createContext, useContext, useEffect, useState } from 'react'

import { reingoldTilford } from '../mapping/reingold-tilford'

const TreeContext = createContext()

const TreeProvider = ({ children, convoTree }) => {
    const mergedMessageIds = convoTree.getMergedMessageIdsAsList()

    const [positions, setPositions] = useState({})
    const [dimensions, setDimensions] = useState({})
    const [highestZIndex, setHighestZIndex] = useState(1)
    const [zIndices, setZIndices] = useState(
        mergedMessageIds.reduce((accumulatedObj, id) => {
            accumulatedObj[id] = 1
            return accumulatedObj
        }, {})
    )

    useEffect(() => {
        if (Object.keys(dimensions).length === mergedMessageIds.length) {
            const newPositions = reingoldTilford(convoTree.roots, dimensions)
            setPositions(newPositions)
        }
    }, [dimensions])

    return (
        <TreeContext.Provider
            value={{
                positions,
                setPositions,
                dimensions,
                setDimensions,
                highestZIndex,
                setHighestZIndex,
                zIndices,
                setZIndices,
            }}
        >
            {children}
        </TreeContext.Provider>
    )
}

const useTreeContext = () => useContext(TreeContext)

export { TreeProvider, useTreeContext }
