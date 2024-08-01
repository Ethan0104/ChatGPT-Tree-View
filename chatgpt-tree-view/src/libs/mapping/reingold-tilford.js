import {
    SIBLING_SEPARATION,
    SUBTREE_SEPARATION,
    LEVEL_SEPARATION,
} from '../../constants/treeLayout'

function reingoldTilford(roots, dimensions) {
    const xOffset = 0
    const yOffset = 0

    const positions = {}
    const globalWidth = dimensions[roots[0].id].width

    const root = {
        id: 'root',

        parent: null,
        children: roots,

        getRoot: () => root,
        getAllDescendants: () =>
            roots
                .map((realRoot) => realRoot.getAllDescendants())
                .flat()
                .concat(roots),
        getLeftSibling: () => null,
        getRightSibling: () => null,

        isRoot: true,

        depth: () => 1,
        maxDepth: () => {
            let maxDepth = 1
            roots.forEach((realRoot) => {
                maxDepth = Math.max(maxDepth, realRoot.maxDepth())
            })
            return maxDepth
        },
    }
    roots.forEach((realRoot) => {
        realRoot.parent = root
    })

    initializePositions(root, positions)
    firstPass(root, positions, dimensions)
    const xAdjustment = secondPass(
        positions,
        globalWidth,
        root,
        xOffset,
        yOffset
    )
    thirdPass(positions, root, xAdjustment)
    swapXYForAll(positions)
    // centerCorrection(positions, dimensions)

    delete positions.root

    return positions
}

function initializePositions(root, positions) {
    // initialize positions so all of them are not null
    const allDescendants = root.getAllDescendants().concat([root])
    allDescendants.forEach((descendant) => {
        positions[descendant.id] = {
            x: 0,
            y: 0,
            mod: 0,
            shift: 0,
        }
    })
}

function firstPass(treeNode, positions, dimensions) {
    // Post-order iteration (LRN)
    treeNode.children.forEach((child) => {
        firstPass(child, positions, dimensions)
    })

    let _x = 0.0
    let _mod = 0.0
    let _shift = 0.0
    let _midpoint = 0.0

    if (treeNode.isRoot) {
        positions[treeNode.id].x = getMidpointOfChildren(treeNode, positions)
        positions[treeNode.id].mod = _mod
        positions[treeNode.id].shift = _shift
    } else {
        // First part - assign x and mod values

        if (treeNode.children.length > 0) {
            _midpoint = getMidpointOfChildren(treeNode, positions)
        }

        if (treeNode.getLeftSibling()) {
            // Non-leftmost node
            const leftSiblingId = treeNode.getLeftSibling().id
            const collisionAvoidance =
                dimensions[treeNode.id].height / 2 +
                dimensions[leftSiblingId].height / 2
            _x =
                positions[leftSiblingId].x +
                collisionAvoidance +
                SIBLING_SEPARATION
            if (treeNode.children.length > 0) {
                _mod = _x - _midpoint
            }
        } else {
            // Leftmost node
            if (treeNode.children.length > 0) {
                _x = _midpoint
            }
        }

        positions[treeNode.id].x = _x
        positions[treeNode.id].mod = _mod
        positions[treeNode.id].shift = positions[treeNode.id].shift || _shift

        // Second part - assign shift values due to overlapping subtrees

        const parentNode = treeNode.parent
        const treeNodeIndex = parentNode.children.indexOf(treeNode)
        if (treeNodeIndex == -1) {
            throw new Error(
                'Parent does not contain this node in its children list'
            )
        }
        if (treeNodeIndex !== 0) {
            for (let i = 0; i < treeNodeIndex; i++) {
                const leftSubtree = parentNode.children[i]
                _shift = Math.max(
                    _shift,
                    getSubtreeShift(
                        positions,
                        dimensions,
                        leftSubtree,
                        treeNode,
                        i,
                        treeNodeIndex
                    )
                )
            }

            // Shift siblings (left siblings, itself, right siblings) accordingly
            parentNode.children.forEach((sibling, multiple) => {
                const id = sibling.id
                const oldShift = positions[id]?.shift || 0
                positions[id].shift =
                    oldShift + (_shift * multiple) / treeNodeIndex
            })
        }
    }
}

function getMidpointOfChildren(treeNode, positions) {
    if (treeNode.children.length > 0) {
        const firstChildId = treeNode.children[0].id
        const lastChildId = treeNode.children[treeNode.children.length - 1].id

        const firstChildX =
            positions[firstChildId].x + positions[firstChildId].shift
        const lastChildX =
            positions[lastChildId].x + positions[lastChildId].shift
        return (firstChildX + lastChildX) / 2
    }
    return 0
}

function getSubtreeShift(
    positions,
    dimensions,
    leftSubtree,
    rightSubtree,
    leftIndex,
    rightIndex,
    leftCumulativeShift = 0,
    rightCumulativeShift = 0,
    cumulativeShift = 0,
    initialRun = true
) {
    let newShift = 0.0

    if (!initialRun) {
        let xLeft =
            positions[leftSubtree.id].x +
            positions[leftSubtree.id].shift +
            leftCumulativeShift
        let xRight =
            positions[rightSubtree.id].x +
            positions[rightSubtree.id].shift +
            rightCumulativeShift +
            cumulativeShift
        const collisionAvoidance =
            dimensions[leftSubtree.id].height / 2 +
            dimensions[rightSubtree.id].height / 2
        newShift = Math.max(
            (xLeft + SUBTREE_SEPARATION + collisionAvoidance - xRight) /
                (1 - leftIndex / rightIndex),
            0
        )

        // Search for a left sibling of leftSubtree that has children
        while (
            leftSubtree &&
            leftSubtree.children.length == 0 &&
            leftSubtree.getLeftSibling()
        ) {
            leftSubtree = leftSubtree.getLeftSibling()
        }

        // Search for a right sibling of rightSubtree that has children
        while (
            rightSubtree &&
            rightSubtree.children.length == 0 &&
            rightSubtree.getRightSibling()
        ) {
            rightSubtree = rightSubtree.getRightSibling()
        }
    }

    if (leftSubtree.children.length > 0 && rightSubtree.children.length > 0) {
        // Iterate down the level, for the rightmost child of leftSubtree and the leftmost child of rightSubtree
        return getSubtreeShift(
            positions,
            dimensions,
            leftSubtree.children[leftSubtree.children.length - 1],
            rightSubtree.children[0],
            leftIndex,
            rightIndex,
            leftCumulativeShift +
                positions[leftSubtree.id].mod +
                positions[leftSubtree.id].shift,
            rightCumulativeShift +
                positions[rightSubtree.id].mod +
                positions[rightSubtree.id].shift,
            cumulativeShift + newShift,
            false
        )
    }

    return cumulativeShift + newShift
}

function secondPass(
    positions,
    globalWidth,
    treeNode,
    xOffset,
    yOffset,
    cumulativeMod = 0.0,
    xAdjustment = 0.0
) {
    const maxDepth = treeNode.maxDepth()

    const finalX =
        positions[treeNode.id].x +
        positions[treeNode.id].shift +
        cumulativeMod +
        xOffset
    const finalY =
        (treeNode.depth() - maxDepth) * (globalWidth + LEVEL_SEPARATION) +
        yOffset
    positions[treeNode.id].x = finalX
    positions[treeNode.id].y = finalY

    // Pre-order iteration (NLR)
    if (treeNode.children.length > 0) {
        return Math.max(
            ...treeNode.children.map((child) => {
                return secondPass(
                    positions,
                    globalWidth,
                    child,
                    xOffset,
                    yOffset,
                    cumulativeMod +
                        positions[treeNode.id].mod +
                        positions[treeNode.id].shift,
                    xAdjustment
                )
            })
        )
    }
    return Math.max(xAdjustment, -finalX)
}

function thirdPass(positions, treeNode, xAdjustment) {
    if (xAdjustment !== 0.0) {
        positions[treeNode.id].x += xAdjustment

        // Pre-order iteration (NLR)
        treeNode.children.forEach((child) => {
            thirdPass(positions, child, xAdjustment)
        })
    }
}

function swapXYForAll(positions) {
    Object.keys(positions).forEach((id) => {
        const { x, y } = positions[id]
        positions[id].x = y
        positions[id].y = x
    })
}

function centerCorrection(positions, dimensions) {
    const ids = Object.keys(positions)
    ids.forEach((id) => {
        if (id === 'root') {
            return
        }

        const position = positions[id]
        const dimension = dimensions[id]
        position.y -= dimension.height / 2
    })
}

export { reingoldTilford }
