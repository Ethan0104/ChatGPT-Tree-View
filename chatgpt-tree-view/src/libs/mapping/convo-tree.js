import { logError } from '../utils'
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
