import React, { createContext, useContext, useEffect, useState } from 'react'

import { SIBLING_SEPARATION, SUBTREE_SEPARATION } from '../../constants/treeLayout'
import { reingoldTilford } from '../mapping/reingold-tilford'

// Helper function to calculate subtree dimensions
function calculateSubtreeDimensions(node, dimensions) {
    if (!node.children.length) {
        return dimensions[node.id]
    }

    let width = dimensions[node.id].width
    let height = dimensions[node.id].height

    node.children.forEach((child) => {
        const childDim = calculateSubtreeDimensions(child, dimensions)
        width = Math.max(width, childDim.width + SIBLING_SEPARATION)
        height += childDim.height + SUBTREE_SEPARATION
    })

    return { width, height }
}

// Helper function to calculate initial positions of nodes
function calculateInitialPositions(
    node,
    dimensions,
    positions,
    offsetX = 0,
    offsetY = 0
) {
    positions[node.id] = { x: offsetX, y: offsetY }
    let currentY = offsetY

    node.children.forEach((child) => {
        const childDim = calculateSubtreeDimensions(child, dimensions)
        calculateInitialPositions(
            child,
            dimensions,
            positions,
            offsetX + dimensions[node.id].width + SIBLING_SEPARATION,
            currentY
        )
        currentY += childDim.height + SUBTREE_SEPARATION
    })
}

function calculateTreePositions(rootNodes, dimensions) {
    const positions = {}

    rootNodes.forEach((root, index) => {
        const rootOffsetY =
            index === 0
                ? 0
                : positions[rootNodes[index - 1].id].y +
                  calculateSubtreeDimensions(rootNodes[index - 1], dimensions)
                      .height +
                  SUBTREE_SEPARATION
        calculateInitialPositions(root, dimensions, positions, 0, rootOffsetY)
    })

    return positions
}

const TreeContext = createContext()

const TreeProvider = ({ children, convoTree }) => {
    const [positions, setPositions] = useState({})
    const [dimensions, setDimensions] = useState({})

    const blocks = convoTree.getElementsAsList()

    useEffect(() => {
        console.log("tree provider", Object.keys(dimensions).length, blocks.length, dimensions)
        if (Object.keys(dimensions).length === blocks.length) {
            // const newPositions = calculateTreePositions(
            //     convoTree.roots,
            //     dimensions
            // )
            const newPositions = reingoldTilford(convoTree.roots, dimensions)
            console.log("ROOT", convoTree.roots[0])
            console.log("newPositions", newPositions)
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
