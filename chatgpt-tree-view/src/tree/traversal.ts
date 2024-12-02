import ConvoTree from '../models/convo-tree'
import Message from '../models/message'

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

export const isMessageInCurrentBranch = (tree: ConvoTree, message: Message): boolean => {
    /**
     * Check if a message is in the current branch of the tree.
     *
     * @param tree - ConvoTree object
     * @param message - Message object
     * @returns True if the message is in the current branch, false otherwise
     */
    
    // to do this, check if the input message is in the list of current branch messages
    return tree.currentBranch.includes(message.id)
}
