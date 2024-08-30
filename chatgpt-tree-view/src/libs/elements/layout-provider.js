import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react'

import { LEVEL_SEPARATION } from '../../constants/treeLayout'
import { useTreeContext } from './tree-provider'
import { reingoldTilford } from '../mapping/reingold-tilford'

const LayoutContext = createContext()

const LayoutProvider = ({ children }) => {
    const { convoTree } = useTreeContext()
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
    const [positionsInitialized, setPositionsInitialized] = useState(false)

    // initialize positions on startup
    useEffect(() => {
        if (positionsInitialized) {
            return
        }
        if (Object.keys(dimensions).length === mergedMessageIds.length) {
            const newPositions = reingoldTilford(convoTree.roots, dimensions)
            setPositions(newPositions)
            setPositionsInitialized(true)
        }
    }, [dimensions, positionsInitialized, setPositionsInitialized])

    const addNewBlock = useCallback(
        (parentId, newBlockId) => {
            const { x: parentX, y: parentY } = positions[parentId]
            const { width: parentWidth, height: parentHeight } =
                dimensions[parentId]
            setPositions((prev) => {
                return {
                    ...prev,
                    [newBlockId]: {
                        x: parentX + parentWidth + LEVEL_SEPARATION,
                        y: parentY,
                    },
                }
            })
        },
        [positions, setPositions, dimensions]
    )

    return (
        <LayoutContext.Provider
            value={{
                positions,
                setPositions,
                dimensions,
                setDimensions,
                highestZIndex,
                setHighestZIndex,
                zIndices,
                setZIndices,
                addNewBlock,
            }}
        >
            {children}
        </LayoutContext.Provider>
    )
}

const useLayoutContext = () => useContext(LayoutContext)

export { LayoutProvider, useLayoutContext }
