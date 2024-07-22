import { logError } from '../utils'
import { MergedMessage } from './merged-message'
import { RawMessage } from './raw-message'

export class ConvoTree {
    constructor(rawMapping, currentNodeId) {
        try {
            // here begins the long process of turning the rawMapping into a tree with supernodes.

            // step 1: find the root
            const rootObj = this.getRoot(rawMapping)

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

            // this.root = new Message(root.id, rawMapping, null) // initializing Message objects partially for now

            // // step 2: delete irrelevant Message objects (invisible ones)
            // this.sanitize()
            // const rootChildrenIds = this.root.childrenIds
            // rootChildrenIds.forEach((id) => {
            //     const child = this.root.children[id]
            //     if (child.author.role !== "user") {
            //         throw new Error("Assertion Error: Root child is not a user message")
            //     }
            // })

            // // step 3: perform Assistant Message Merging
            // // Dall-E Merging, and
            // // Code Block Merging

            // // step 4: perform User-Assistant Message Merging

            // this.currentNodeId = currentNodeId
            // this.currentNode = this.findMessageById(currentNodeId)

            // this.renderElementsForAll()
        } catch (error) {
            logError('Failed to initialize ConvoTree: ', error)
        }
    }

    getRoot(rawMapping) {
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

    findMessageById(id) {
        return this.rawRoot.findMessageById(id)
    }

    sanitize() {
        let messageIdsToDelete = []
        this.rawRoot.traverseAndFlagMessagesToRemove(messageIdsToDelete)
        messageIdsToDelete.forEach((id) => {
            this.rawRoot.deleteChildMessageById(id)
        })
    }

    renderElementsForAll() {
        this.rawRoot.renderElementRecurse()
    }

    printRawTreePreOrder() {
        this.rawRoot.printPreOrder()
    }

    printMergedTreePreOrder() {
        this.roots.forEach((root) => {
            root.printPreOrder()
        })
    }
}
