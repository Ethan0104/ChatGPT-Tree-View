declare module "non-layered-tidy-tree-layout" {
  export class BoundingBox {
    constructor(gap: number, bottomPadding: number)
  }
  export class Layout {
    constructor(boundingBox: BoundingBox)
    layout(treeData: TreeData): { result: ResultTreeData, boundingBox: BoundingBox }
  }
}