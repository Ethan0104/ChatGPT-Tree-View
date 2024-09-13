import { BoundingBox, Layout } from 'non-layered-tidy-tree-layout'
import { LEVEL_SEPARATION, SIBLING_SEPARATION } from '../constants/treeLayout'
import logger from '../logger'
import ConvoTree from '../models/convo-tree'
import Message from '../models/message'
import { ResultTreeData, TreeData } from '../models/tree-data'
import Vector from '../models/vector'

const positionConvoTree = (
    convoTree: ConvoTree,
    dimensions: Record<string, Vector>
): Record<string, Vector> => {
    const bb = new BoundingBox(SIBLING_SEPARATION, LEVEL_SEPARATION)
    const layout = new Layout(bb)
    const treeData = convoTreeToTreeData(convoTree, dimensions)
    const { result } = layout.layout(treeData)
    return treeResultToPositions(result)
}

const convoTreeToTreeData = (
    convoTree: ConvoTree,
    dimensions: Record<string, Vector>
): TreeData => {
    const treeData: TreeData = {
        id: 'fake root', // to handle the multi-root ConvoTree
        width: 1,
        height: 1,
        children: [],
    }

    const traverse = (node: Message): TreeData => {
        const children: TreeData[] = node.children.map((child) =>
            traverse(child)
        )
        const nodeData: TreeData = {
            id: node.id,
            width: dimensions[node.id].x,
            height: dimensions[node.id].y,
            children,
        }
        return nodeData
    }

    convoTree.roots.forEach((root) => {
        treeData.children.push(traverse(root))
    })

    return treeData
}

const treeResultToPositions = (
    result: ResultTreeData
): Record<string, Vector> => {
    const positions: Record<string, Vector> = {}

    const traverse = (node: ResultTreeData) => {
        if (node.id !== 'fake root') {
            positions[node.id] = { x: node.x, y: node.y }
        }
        node.children.forEach((child) => traverse(child))
    }

    traverse(result)
    return positions
}

export default positionConvoTree
