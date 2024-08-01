import React, { useEffect, useState } from 'react'

import { useTreeContext } from './tree-provider'
import { Arrow } from './arrow'

const TreeContainer = ({ convoTree }) => {
    const { positions, dimensions } = useTreeContext()
    const [arrowParams, setArrowParams] = useState([]) // in this array, each element is an object with the following keys: {startX, startY, endX, endY}

    // compute the parameters for the arrows
    useEffect(() => {
        // wait until positions are ready
        if (Object.keys(positions).length !== convoTree.nodeCount()) {
            return
        }

        const newArrowParams = []

        // post order traversal of the tree, compute the arrow parameters
        const postOrderTraversal = (node) => {
            if (node.children.length === 0) {
                return
            }

            node.children.forEach((child) => {
                postOrderTraversal(child)

                // compute the arrow parameters
                const arrowParam = {
                    x0: positions[node.id].x,
                    y0: positions[node.id].y - dimensions[node.id].height / 2,
                    w0: dimensions[node.id].width,
                    h0: dimensions[node.id].height,
                    x1: positions[child.id].x,
                    y1: positions[child.id].y - dimensions[child.id].height / 2,
                    w1: dimensions[child.id].width,
                    h1: dimensions[child.id].height,
                }
                newArrowParams.push(arrowParam)
            })
        }

        convoTree.roots.forEach((root) => {
            postOrderTraversal(root)
        })

        setArrowParams(newArrowParams)
    }, [convoTree, positions])

    // get all the blocks in the tree
    const blocks = convoTree.getElementsAsList()
    return (
        <>
            {blocks}
            {arrowParams.map((arrowParam) => {
                return <Arrow {...arrowParam} />
            })}
        </>
    )
}

export { TreeContainer }
