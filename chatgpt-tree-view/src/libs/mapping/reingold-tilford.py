from typing import Optional, TypeVar

from bigtree.node.basenode import BaseNode

__all__ = [
    "reingoldTilford",
]

T = TypeVar("T", bound=BaseNode)


def reingoldTilford(
    treeNode: T,
    SIBLING_SEPARATION: float = 1.0,
    SUBTREE_SEPARATION: float = 1.0,
    LEVEL_SEPARATION: float = 1.0,
    xOffset: float = 0.0,
    yOffset: float = 0.0,
) -> None:
    firstPass(treeNode, SIBLING_SEPARATION, SUBTREE_SEPARATION)
    xAdjustment = secondPass(treeNode, LEVEL_SEPARATION, xOffset, yOffset)
    thirdPass(treeNode, xAdjustment)


def firstPass(
    treeNode: T, SIBLING_SEPARATION: float, SUBTREE_SEPARATION: float
) -> None:
    # Post-order iteration (LRN)
    for child in treeNode.children:
        firstPass(child, SIBLING_SEPARATION, SUBTREE_SEPARATION)

    _x = 0.0
    _mod = 0.0
    _shift = 0.0
    _midpoint = 0.0

    if treeNode.is_root:
        treeNode.set_attrs({"x": getMidpointOfChildren(treeNode)})
        treeNode.set_attrs({"mod": _mod})
        treeNode.set_attrs({"shift": _shift})

    else:
        # First part - assign x and mod values

        if treeNode.children:
            _midpoint = getMidpointOfChildren(treeNode)

        # Non-leftmost node
        if treeNode.left_sibling:
            _x = treeNode.left_sibling.get_attr("x") + SIBLING_SEPARATION
            if treeNode.children:
                _mod = _x - _midpoint
        # Leftmost node
        else:
            if treeNode.children:
                _x = _midpoint

        treeNode.set_attrs({"x": _x})
        treeNode.set_attrs({"mod": _mod})
        treeNode.set_attrs({"shift": treeNode.get_attr("shift", _shift)})

        # Second part - assign shift values due to overlapping subtrees

        parentNode = treeNode.parent
        treeNodeIndex = parentNode.children.index(treeNode)
        if treeNodeIndex:
            for indexNode in range(treeNodeIndex):
                leftSubtree = parentNode.children[indexNode]
                _shift = max(
                    _shift,
                    getSubtreeShift(
                        leftSubtree=leftSubtree,
                        rightSubtree=treeNode,
                        leftIndex=indexNode,
                        rightIndex=treeNodeIndex,
                        SUBTREE_SEPARATION=SUBTREE_SEPARATION,
                    ),
                )

            # Shift siblings (left siblings, itself, right siblings) accordingly
            for multiple, sibling in enumerate(parentNode.children):
                sibling.set_attrs(
                    {
                        "shift": sibling.get_attr("shift", 0)
                        + (_shift * multiple / treeNodeIndex)
                    }
                )


def getMidpointOfChildren(treeNode: BaseNode) -> float:
    if treeNode.children:
        firstChildX: float = treeNode.children[0].get_attr("x") + treeNode.children[
            0
        ].get_attr("shift")
        lastChildX: float = treeNode.children[-1].get_attr("x") + treeNode.children[
            -1
        ].get_attr("shift")
        return (lastChildX + firstChildX) / 2
    return 0.0


def getSubtreeShift(
    leftSubtree: T,
    rightSubtree: T,
    leftIndex: int,
    rightIndex: int,
    SUBTREE_SEPARATION: float,
    leftCumulativeShift: float = 0,
    rightCumulativeShift: float = 0,
    cumulativeShift: float = 0,
    initialRun: bool = True,
) -> float:
    newShift = 0.0

    if not initialRun:
        xLeft = (
            leftSubtree.get_attr("x") + leftSubtree.get_attr("shift") + leftCumulativeShift
        )
        xRight = (
            rightSubtree.get_attr("x")
            + rightSubtree.get_attr("shift")
            + rightCumulativeShift
            + cumulativeShift
        )
        newShift = max(
            (xLeft + SUBTREE_SEPARATION - xRight) / (1 - leftIndex / rightIndex), 0
        )

        # Search for a left sibling of leftSubtree that has children
        while leftSubtree and not leftSubtree.children and leftSubtree.left_sibling:
            leftSubtree = leftSubtree.left_sibling

        # Search for a right sibling of rightSubtree that has children
        while (
            rightSubtree and not rightSubtree.children and rightSubtree.right_sibling
        ):
            rightSubtree = rightSubtree.right_sibling

    if leftSubtree.children and rightSubtree.children:
        # Iterate down the level, for the rightmost child of leftSubtree and the leftmost child of rightSubtree
        return getSubtreeShift(
            leftSubtree=leftSubtree.children[-1],
            rightSubtree=rightSubtree.children[0],
            leftIndex=leftIndex,
            rightIndex=rightIndex,
            SUBTREE_SEPARATION=SUBTREE_SEPARATION,
            leftCumulativeShift=(
                leftCumulativeShift
                + leftSubtree.get_attr("mod")
                + leftSubtree.get_attr("shift")
            ),
            rightCumulativeShift=(
                rightCumulativeShift
                + rightSubtree.get_attr("mod")
                + rightSubtree.get_attr("shift")
            ),
            cumulativeShift=cumulativeShift + newShift,
            initialRun=False,
        )

    return cumulativeShift + newShift


def secondPass(
    treeNode: T,
    LEVEL_SEPARATION: float,
    xOffset: float,
    yOffset: float,
    cumulativeMod: Optional[float] = 0.0,
    maxDepth: Optional[int] = None,
    xAdjustment: Optional[float] = 0.0,
) -> float:
    if not maxDepth:
        maxDepth = treeNode.max_depth

    finalX: float = (
        treeNode.get_attr("x") + treeNode.get_attr("shift") + cumulativeMod + xOffset
    )
    finalY: float = (maxDepth - treeNode.depth) * LEVEL_SEPARATION + yOffset
    treeNode.set_attrs({"x": finalX, "y": finalY})

    # Pre-order iteration (NLR)
    if treeNode.children:
        return max(
            [
                secondPass(
                    child,
                    LEVEL_SEPARATION,
                    xOffset,
                    yOffset,
                    cumulativeMod + treeNode.get_attr("mod") + treeNode.get_attr("shift"),
                    maxDepth,
                    xAdjustment,
                )
                for child in treeNode.children
            ]
        )
    return max(xAdjustment, -finalX)


def thirdPass(treeNode: BaseNode, xAdjustment: float) -> None:
    if xAdjustment:
        treeNode.set_attrs({"x": treeNode.get_attr("x") + xAdjustment})

        # Pre-order iteration (NLR)
        for child in treeNode.children:
            thirdPass(child, xAdjustment)