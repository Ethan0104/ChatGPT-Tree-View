import React, { useEffect, useState } from 'react'

import { useTreeContext } from '../providers/tree-provider'
import { useLayoutContext } from '../providers/layout-provider'
import Arrow from './arrow'
import { getAllMessages, getNodeCount, isMessageInCurrentBranch } from '../tree/traversal'
import ArrowParam from '../models/arrow-param'
import Message from '../models/message'
import MessageBlock from './message-block'
import logger from '../logger'

const TreeContainer: React.FC = () => {
    const { convoTree } = useTreeContext()
    const { positions, dimensions } = useLayoutContext()
    const [arrowParams, setArrowParams] = useState<ArrowParam[]>([])

    // compute the parameters for the arrows
    useEffect(() => {
        // wait until positions are ready
        if (
            Object.keys(positions).length !== getNodeCount(convoTree) ||
            Object.keys(positions).length !== Object.keys(dimensions).length
        ) {
            return
        }

        const newArrowParams: ArrowParam[] = []

        // post order traversal of the tree, compute the arrow parameters
        const postOrderTraversal = (node: Message) => {
            if (node.children.length === 0) {
                return
            }

            node.children.forEach((child) => {
                postOrderTraversal(child)

                // compute the arrow parameters
                const arrowParam = {
                    x0: positions[node.id].x,
                    y0: positions[node.id].y,
                    w0: dimensions[node.id].x,
                    h0: dimensions[node.id].y,
                    x1: positions[child.id].x,
                    y1: positions[child.id].y,
                    w1: dimensions[child.id].x,
                    h1: dimensions[child.id].y,
                    isHighlighted: isMessageInCurrentBranch(convoTree, child),
                }
                newArrowParams.push(arrowParam)
            })
        }

        convoTree.roots.forEach((root) => {
            postOrderTraversal(root)
        })

        setArrowParams(newArrowParams)
    }, [convoTree, positions, dimensions])

    // get all the blocks in the tree
    return (
        <>
            {getAllMessages(convoTree).map((message, index) => {
                return <MessageBlock key={message.id} message={message} />
            })}
            {arrowParams.map((arrowParam, index) => {
                return <Arrow key={index} {...arrowParam} />
            })}
        </>
    )
}

export default TreeContainer
