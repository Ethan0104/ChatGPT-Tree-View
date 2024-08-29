import { logError } from '../logger'
import { MergedMessage } from './merged-message'
import { RawMessage } from './raw-message'

export class ConvoTree {
    constructor(rawMapping, currentNodeId) {
        try {
            // here begins the long process of turning the rawMapping into a tree with supernodes.

            // step 1: find the root
            const rootObj = this.getRawRoot(rawMapping)

            // step 2: parse the rawMapping object into a tree of RawMessage objects
            this.rawRoot = new RawMessage(rootObj.id, rawMapping, null)

            // step 3: delete irrelevant RawMessage objects (invisible ones)
            this.sanitize()

            // step 4: starting from the root's children (which are user messages),
            // create a tree of MergedMessage objects
            this.roots = []
            const rootChildrenIds = this.rawRoot.childrenIds
            rootChildrenIds.forEach((id) => {
                const child = this.rawRoot.children[id]
                if (!child.isUserMessage()) {
                    throw new Error(
                        'Assertion Error: Root child is not a user message'
                    )
                }

                this.roots.push(new MergedMessage(child, null))
            })

            // step 5: render the elements for all the supernodes
            this.renderElementsForAll()
        } catch (error) {
            logError('Failed to initialize ConvoTree: ', error)
        }
    }

    // --- SETUP ---

    getRawRoot(rawMapping) {
        const messageIds = Object.keys(rawMapping)
        const filteredId = messageIds.filter(
            (id) => rawMapping[id].parent === null
        )
        if (filteredId.length !== 1) {
            throw new Error(
                `Root node number is not 1, found ${filteredId.length}`
            )
        }
        return rawMapping[filteredId[0]]
    }

    findRawMessageById(id) {
        return this.rawRoot.findRawMessageById(id)
    }

    sanitize() {
        let messageIdsToDelete = []
        this.rawRoot.traverseAndFlagMessagesToRemove(messageIdsToDelete)
        messageIdsToDelete.forEach((id) => {
            this.rawRoot.deleteChildMessageById(id)
        })
    }

    // --- TREE UTILS ---
    nodeCount() {
        const traverse = (merged) => {
            let count = 1
            merged.children.forEach((child) => {
                count += traverse(child)
            })
            return count
        }

        let count = 0
        this.roots.forEach((root) => {
            count += traverse(root)
        })
        return count
    }

    // --- UI STUFF ---

    renderElementsForAll() {
        this.roots.forEach((root) => {
            root.renderElementRecurse()
        })
    }

    getElementsAsList() {
        const result = []
        const traverse = (merged) => {
            result.push(merged.element)
            merged.children.forEach((child) => traverse(child))
        }
        this.roots.forEach((root) => traverse(root))
        return result
    }

    getMergedMessageIdsAsList() {
        const result = []
        const traverse = (merged) => {
            result.push(merged.id)
            merged.children.forEach((child) => traverse(child))
        }
        this.roots.forEach((root) => traverse(root))
        return result
    }

    addUserMessage(parentMergedMessageId) {
        // find the parent
        let parent = null
        const traverse = (merged) => {
            if (merged.id === parentMergedMessageId) {
                parent = merged
                return
            }
            merged.children.forEach((child) => traverse(child))
        }
        this.roots.forEach((root) => traverse(root))

        if (parent === null) {
            throw new Error('Parent not found')
        }

        // create the new user message
        const newMergedMessage = new MergedMessage(null, parent)
        newMergedMessage.initElement()
        parent.children.push(newMergedMessage)
        const id = newMergedMessage.id
        return id
    }

    // --- DEBUGGING ---

    printRawTreePreOrder() {
        this.rawRoot.printPreOrder()
    }

    printMergedTreePreOrder() {
        this.roots.forEach((root) => {
            root.printPreOrder()
        })
    }
}
