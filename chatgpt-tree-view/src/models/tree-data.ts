interface TreeData {
    id: string
    width: number
    height: number
    children: TreeData[]
}

interface ResultTreeData {
    id: string
    x: number
    y: number
    width: number
    height: number
    children: ResultTreeData[]
}

export { ResultTreeData, TreeData }
