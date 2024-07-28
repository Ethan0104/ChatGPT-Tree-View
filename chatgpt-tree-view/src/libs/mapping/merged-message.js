import React from 'react'

import {
    ContentPart,
    CONTENT_PART_TYPES,
    UserMessage,
    AssistantReply,
} from './util-models'
import { MergedMessageBlock } from '../elements/message-block'
import { logError } from '../utils'
import { MODEL_TYPES } from '../../constants/modelTypes'

export class MergedMessage {
    // the class that represents a supernode in the tree:
    // it is a collection of 1 user message and (potentially) multiple multipart assistant messages
    constructor(rawUserMessage, parent) {
        this.id = rawUserMessage.id
        this.parent = parent

        // load the user message first, the user message is like the root within the tree in this supernode
        try {
            this.userMessage = this.loadUserMessage(rawUserMessage)
        } catch (error) {
            logError('Failed to load User Message: ', error)
        }

        // explore the paths that stem from the user message (this will have more than one path iff "regenerate" is used)
        try {
            const childrenIds = rawUserMessage.childrenIds
            const leafMessages = []
            this.assistantBranches = childrenIds.map((childId) => {
                const rawMessages = this.validateAndExtractLinkedList(
                    rawUserMessage,
                    childId
                )

                // note down the leaf message of this branch while we are at it
                const lastRawMessage = rawMessages[rawMessages.length - 1]
                leafMessages.push(lastRawMessage)

                return this.buildSingleAssistantMessage(rawMessages)
            })

            // aggregate the children of the leaf messages
            this.children = []
            leafMessages.forEach((leafMessage) => {
                // leafMessage is a RawMessage object
                const leafChildrenIds = leafMessage.childrenIds
                const leafChildren = leafChildrenIds.map((childId) => {
                    return leafMessage.children[childId]
                })

                leafChildren.forEach((leafChild) => {
                    if (!leafChild.isUserMessage()) {
                        throw new Error(
                            'Assertion Error: Expected leaf children to be user messages'
                        )
                    }

                    this.children.push(new MergedMessage(leafChild, this))
                })
            })
        } catch (error) {
            logError(
                'Failed to load (potentially) multiple multipart Assistant Messages: ',
                error
            )
        }
    }

    // --- SETUP HELPERS ---

    loadUserMessage(rawUserMessage) {
        const rawParts = rawUserMessage?.content?.parts || []
        const rawAttachments = rawUserMessage?.metadata?.attachments || []

        // do a filter for texts only because images will be in the attachments field anyways
        const filteredRawParts = rawParts.filter(
            (part) => typeof part === 'string'
        )
        const contentFieldChunks = filteredRawParts.map((part) => {
            return new ContentPart(CONTENT_PART_TYPES.TEXT, part)
        })
        const attachmentFieldChunks = rawAttachments.map((attachment) => {
            const type = attachment.mime_type.includes('image')
                ? CONTENT_PART_TYPES.IMAGE
                : CONTENT_PART_TYPES.FILE
            return new ContentPart(type, attachment.id, attachment.mime_type)
        })
        const combinedChunks = attachmentFieldChunks.concat(contentFieldChunks)
        return new UserMessage(combinedChunks)
    }

    validateAndExtractLinkedList(rawUserMessage, childId) {
        const rawMessages = []
        let currentChildId = childId
        let currentChild = rawUserMessage.children[currentChildId]
        while (currentChild && !currentChild.isUserMessage()) {
            rawMessages.push(currentChild)
            if (currentChild.childrenIds.length == 0) {
                break
            } else if (currentChild.childrenIds.length != 1) {
                currentChild.childrenIds.forEach((childId) => {
                    const child = currentChild.children[childId]
                    if (!child.isUserMessage()) {
                        throw new Error(
                            `Assertion Error: Expected the assistant response branch to be linear, but ${currentChild.id} has ${currentChild.childrenIds.length} children.`
                        )
                    }
                })
            }
            currentChildId = currentChild.childrenIds[0]
            currentChild = currentChild.children[currentChildId]
        }
        return rawMessages
    }

    buildSingleAssistantMessage(rawMessages) {
        const modelSlug = this.findModelSlugFromListOfMessages(rawMessages)
        const chunks = []
        rawMessages.forEach((rawMessage) => {
            const contentType = rawMessage.content.content_type
            if (contentType === 'text' || contentType === 'multimodal_text') {
                const parts = rawMessage.content.parts
                parts.forEach((part) => {
                    if (typeof part === 'string') {
                        chunks.push(
                            new ContentPart(CONTENT_PART_TYPES.TEXT, part)
                        )
                    } else if (typeof part === 'object') {
                        chunks.push(
                            new ContentPart(
                                CONTENT_PART_TYPES.IMAGE,
                                part.asset_pointer.replace(
                                    'file-service://',
                                    ''
                                )
                            )
                        )
                    }
                })
            } else if (contentType === 'execution_output') {
                chunks.push(
                    new ContentPart(CONTENT_PART_TYPES.CODE, {
                        code: rawMessage.metadata?.aggregate_result?.code || '',
                        result: rawMessage.content.text,
                    })
                )
            } else {
                throw new Error(
                    `Unexpected content type when building assistant message chunks: ${contentType}`
                )
            }
        })
        return new AssistantReply(chunks, modelSlug)
    }

    findModelSlugFromListOfMessages(rawMessages) {
        rawMessages.forEach((rawMessage) => {
            const modelSlug = rawMessage.metadata?.model_slug
            if (modelSlug && MODEL_TYPES.includes(modelSlug)) {
                return modelSlug
            }
        })
        return null
    }

    // --- UTILITY FUNCTIONS ---

    findMessageById(id) {
        if (this.id === id) {
            return this
        }

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i]
            const result = child.findMessageById(id)
            if (result) {
                return result
            }
        }
        return null
    }

    // --- UI STUFF ---

    initElement() {
        this.element = <MergedMessageBlock message={this} />
    }

    renderElementRecurse() {
        this.initElement()
        this.children.forEach((child) => {
            child.renderElementRecurse()
        })
    }

    // --- DEBUGGING ---

    printPreOrder() {
        console.log(
            `User: ${this.id}\n${JSON.stringify(
                this.userMessage,
                null,
                2
            )}\nAssistant: ${JSON.stringify(this.assistantBranches, null, 2)}`
        )
        this.children.forEach((child) => {
            child.printPreOrder()
        })
    }
}
