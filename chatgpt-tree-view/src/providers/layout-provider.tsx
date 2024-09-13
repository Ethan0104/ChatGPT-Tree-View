import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react'

import { useTreeContext } from './tree-provider'
import positionConvoTree from '../tree/positioning'
import Vector from '../models/vector'
import { getAllMessageIdsOfTree } from '../tree/traversal'
import logger from '../logger'
import { LEVEL_SEPARATION } from '../constants/treeLayout'

interface LayoutContextValue {
    positions: Record<string, Vector>
    setPositions: React.Dispatch<React.SetStateAction<Record<string, Vector>>>
    dimensions: Record<string, Vector>
    setDimensions: React.Dispatch<React.SetStateAction<Record<string, Vector>>>
    highestZIndex: number
    setHighestZIndex: React.Dispatch<React.SetStateAction<number>>
    zIndices: Record<string, number>
    setZIndices: React.Dispatch<React.SetStateAction<Record<string, number>>>
    addNewBlock: (parentId: string, newBlockId: string) => void
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)

interface LayoutProviderProps {
    children: React.ReactNode
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
    const { convoTree } = useTreeContext()
    const messageIds = getAllMessageIdsOfTree(convoTree)

    const [positions, setPositions] = useState<Record<string, Vector>>({})
    const [dimensions, setDimensions] = useState<Record<string, Vector>>({})
    const [highestZIndex, setHighestZIndex] = useState<number>(1)
    const [zIndices, setZIndices] = useState<Record<string, number>>(
        messageIds.reduce((accumulatedObj: Record<string, number>, id: string) => {
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
        if (Object.keys(dimensions).length === messageIds.length) {
            const newPositions = positionConvoTree(convoTree, dimensions)
            logger.debug('New positions:', newPositions)
            setPositions(newPositions)
            setPositionsInitialized(true)
        }
    }, [dimensions, positionsInitialized, setPositionsInitialized])

    const addNewBlock = useCallback(
        (parentId: string, newBlockId: string) => {
            const { x: parentX, y: parentY } = positions[parentId]
            const { x: parentWidth, y: parentHeight } =
                dimensions[parentId]
            setPositions((prev) => {
                return {
                    ...prev,
                    [newBlockId]: {
                        x: parentX,
                        y: parentY + parentHeight + LEVEL_SEPARATION,
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

const useLayoutContext = () => {
    const context = useContext(LayoutContext)
    if (context === undefined) {
        throw new Error('useLayoutContext must be used within a LayoutProvider')
    }
    return context
}

export { LayoutProvider, useLayoutContext }
