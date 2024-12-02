import Message from './message'

interface ConvoTree {
    // 2 APIs for getting nodes: mapping (O(1) access to any given node by id) and root (good for traversals)
    mapping: { [id: string]: Message }
    roots: Message[]
    currentBranch: string[]

    conversationId: string
    isArchived: boolean
    title: string
}

export default ConvoTree
