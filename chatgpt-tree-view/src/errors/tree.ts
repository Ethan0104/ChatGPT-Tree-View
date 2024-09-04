export class NoAssistantMessageInRawMessageListError extends Error {
    constructor() {
        super(
            'No assistant message found in the raw message list. This is unexpected.'
        )
        this.name = 'NoAssistantMessageInRawMessageListError'
    }
}

export class NoModelSlugInAssistantMessageError extends Error {
    constructor() {
        super(
            'No model slug found in the assistant message. This is unexpected.'
        )
        this.name = 'NoModelSlugInAssistantMessageError'
    }
}

export class MultipleRootsInRawMappingError extends Error {
    constructor() {
        super(
            'Multiple root nodes found in the raw mapping. This is unexpected.'
        )
        this.name = 'MultipleRootsInRawMappingError'
    }
}

export class ChildrenOfRootOrAssistantBranchIsntUserMessageError extends Error {
    constructor() {
        super(
            'Children of root or assistant branch should be user messages. This is unexpected.'
        )
        this.name = 'ChildrenOfRootOrAssistantBranchIsntUserMessageError'
    }
}

export class AssistantBranchIsNonLinearError extends Error {
    constructor() {
        super('Assistant branch should be linear. This is unexpected.')
        this.name = 'AssistantBranchIsNonLinearError'
    }
}
