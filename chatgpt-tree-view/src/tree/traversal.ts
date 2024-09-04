import ConvoTree from "../models/convo-tree"
import Message from "../models/message"

export const getAllMessageIdsOfTree = (tree: ConvoTree): string[] => {
    /**
     * Get all message ids of a tree.
     *
     * @param tree - ConvoTree object
     * @returns Array of message ids
     */
    return Object.keys(tree.mapping)
}

export const getNodeCount = (tree: ConvoTree): number => {
    /**
     * Get the number of nodes in a tree.
     *
     * @param tree - ConvoTree object
     * @returns Number of nodes
     */
    return Object.keys(tree.mapping).length
}

export const getAllMessages = (tree: ConvoTree): Message[] => {
    /**
     * Get all messages in a tree.
     *
     * @param tree - ConvoTree object
     * @returns Array of messages
     */
    return Object.values(tree.mapping)
}
