class RawMessage {
    constructor(id, rawMapping, parent) {
        const raw = rawMapping[id]

        this.id = id
        this.parent = parent
        this.childrenIds = raw.children
        this.children = {}
        this.childrenIds.forEach((childId) => {
            this.children[childId] = new RawMessage(childId, rawMapping, this)
        })
        this.isRoot = !this.parent

        this.message = raw.message
        this.author = this.message?.author // guaranteed to be not null if not root node
        this.content = this.message?.content // guaranteed to be not null if not root node
        this.metadata = this.message?.metadata // guaranteed to be not null if not root node
        this.recipient = this.message?.recipient // guaranteed to be not null if not root node
    }

    findRawMessageById(id) {
        if (this.id === id) {
            return this
        }

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i]
            const result = child.findRawMessageById(id)
            if (result) {
                return result
            }
        }
        return null
    }

    deleteChildMessageById(id) {
        if (this.childrenIds.includes(id)) {
            // Base case
            // if the child to delete has children, its children should be bumped up to this level
            const child = this.children[id]
            if (child.childrenIds.length > 0) {
                child.childrenIds.forEach((childId) => {
                    this.childrenIds.push(childId)
                    this.children[childId] = child.children[childId]
                })
            }

            // finally, delete this child
            this.childrenIds = this.childrenIds.filter(
                (childId) => childId !== id
            )
            delete this.children[id]
        } else {
            // Recursive case
            this.childrenIds.forEach((childId) => {
                this.children[childId].deleteChildMessageById(id, true)
            })
        }
    }

    traverseAndFlagMessagesToRemove(idsToRemove) {
        this.childrenIds.forEach((childId) => {
            const child = this.children[childId]
            if (child.isMessageHidden()) {
                idsToRemove.push(child.id)
            }

            child.traverseAndFlagMessagesToRemove(idsToRemove)
        })
    }

    isMessageHidden() {
        if (this.isRoot) return false // Root message is always 'visible'

        if (
            // obvious
            this.metadata.is_visually_hidden_from_conversation == true ||
            // user memories
            this.content.content_type === 'model_editable_context' ||
            // file summary
            this.content.content_type === 'tether_quote' ||
            // bio is a message that says memory is updated, and myfiles_browser is same as above, just a file summary
            (this.author.role === 'tool' &&
                (this.author.name === 'bio' ||
                    this.author.name === 'myfiles_browser')) ||
            // system messages
            this.author.role === 'system' ||
            // the prompt for Dall-E sent by the assistant
            (this.author.role === 'assistant' &&
                this.recipient === 'dalle.text2im') ||
            // the assistant trying to update memory
            (this.author.role === 'assistant' && this.recipient === 'bio') ||
            // dall-e spitting the prompt back
            (this.author.role === 'tool' &&
                this.author.name === 'dalle.text2im' &&
                this.content.content_type === 'text') ||
            // assistant sends code to python runner (visible but delete because the execution output message contains the code)
            (this.author.role === 'assistant' &&
                this.recipient === 'python' &&
                this.content.content_type === 'code')
        ) {
            return true
        }
        return false
    }

    isUserMessage() {
        return this.author.role === 'user'
    }

    printPreOrder() {
        console.log(`${this.id}: ${JSON.stringify(this.message, null, 2)}`)
        this.childrenIds.forEach((childId) => {
            this.children[childId].printPreOrder()
        })
    }
}

export default RawMessage
