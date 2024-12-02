import logger from '../logger'
import Author from '../models/author'
import { Chunk } from '../models/content'
import ConversationResponse from '../models/conversation-response'
import ConvoTree from '../models/convo-tree'
import Message from '../models/message'
import { RawAuthorRole } from '../models/raw-author'
import {
    MultimodalContent,
    RawContentType,
    TextContent,
} from '../models/raw-content'
import RawMessage from '../models/raw-message'

import {
    AssistantBranchIsNonLinearError,
    ChildrenOfRootOrAssistantBranchIsntUserMessageError,
    MultipleRootsInRawMappingError,
    NoAssistantMessageInRawMessageListError,
    NoModelSlugInAssistantMessageError,
} from '../errors/tree'
import { FileAttachment, ImageAttachment } from '../models/attachment'
import RawEntry from '../models/raw-entry'
import RawMapping from '../models/raw-mapping'
import { filterHiddenEntries } from './preprocessing'

const parse = (response: ConversationResponse): ConvoTree => {
    /**
     * Master function that parses a conversation response into a tree structure.
     *
     * @param response - Conversation response to parse
     * @returns Parsed ConvoTree object
     */

    // here begins the long process of turning the rawMapping into a tree with supernodes.

    // Step 1: Find the root entry (the one with no message and no parent)
    const rootEntry = findRootEntry(response.mapping)

    // Step 2: Sanitize the mapping by removing hidden entries
    filterHiddenEntries(response.mapping)

    // Step 3: parse the Message roots of the final tree (the second interface of the convo tree) first
    // the Message roots are the children of the root entry
    const roots = rootEntry.children.map((childId) =>
        recursiveEntryParser(childId, response.mapping, null)
    )

    // Step 4: work on the O(1) interface of the convo tree
    const mapping: { [id: string]: Message } = {}
    const traverse = (message: Message) => {
        mapping[message.id] = message
        message.children.forEach((child) => traverse(child))
    }
    roots.forEach((root) => traverse(root))

    // Step 5: find the list of messages in the current branch
    let currentBranch = [response.current_node]
    let currentMessage = mapping[response.current_node]
    while (currentMessage.parent) {
        currentBranch.unshift(currentMessage.parent.id)
        currentMessage = currentMessage.parent
    }

    // Step 5: return the final ConvoTree object
    return {
        mapping,
        roots,
        currentBranch,
        conversationId: response.conversation_id,
        isArchived: response.is_archived,
        title: response.title,
    }
}

const findRootEntry = (mapping: RawMapping): RawEntry => {
    /**
     * Finds the root entry in a mapping.
     *
     * @param mapping - Mapping to search
     * @returns Root entry
     * @throws MultipleRootsInRawMappingError if multiple root entries are found
     */

    const entries = Object.values(mapping)
    const roots = entries.filter(
        (entry) => entry.parent === null && entry.message === null
    )
    if (roots.length !== 1) {
        const error = new MultipleRootsInRawMappingError()
        logger.error(error.message, `found ${roots.length} root entries`)
        throw new MultipleRootsInRawMappingError()
    }
    return roots[0]
}

const recursiveEntryParser = (
    entryId: string,
    mapping: RawMapping,
    parent: Message | null
): Message => {
    /**
     * Recursively traverses the raw mapping to parse a user entry and its children.
     *
     * @param entryId - ID of the entry to parse, always a user entry unless something went wrong
     * @param mapping - Raw mapping from the conversation response
     * @param parent - Parent Message object or null if the entry is the root
     * @returns Parsed Message object (with children)
     * @throws ChildrenOfRootOrAssistantBranchIsntUserMessageError if a child of the root or assistant branch isn't a user message
     */

    const entry = mapping[entryId]
    if (entry.message?.author.role !== RawAuthorRole.USER) {
        const error = new ChildrenOfRootOrAssistantBranchIsntUserMessageError()
        logger.error(error.message)
        throw error
    }

    const userMessage = parseUserEntry(entryId, mapping)
    userMessage.parent = parent

    // explore the children of the user entry (assistant branches)
    const assistantBranches = entry.children.map((childId) =>
        validateAndExtractAssistantBranch(childId, mapping)
    )

    // merge the assistant branches into a single assistant message
    const assistantMessages = assistantBranches.map((assistantBranch) =>
        mergeAssistantBranch(assistantBranch)
    )
    userMessage.children = assistantMessages.map((assistantMessage) => {
        assistantMessage.parent = userMessage
        return assistantMessage
    })
    assistantMessages.forEach((assistantMessage, index) => {
        const currentBranch = assistantBranches[index]
        const lastRawMessage = currentBranch[currentBranch.length - 1]
        assistantMessage.children = lastRawMessage.children.map((childId) => {
            return recursiveEntryParser(childId, mapping, assistantMessage)
        })
    })

    return userMessage
}

const parseUserEntry = (entryId: string, mapping: RawMapping): Message => {
    /**
     * Parses a user entry in the raw mapping into a Message object.
     *
     * @param entryId - ID of the entry to parse
     * @param mapping - Raw mapping
     * @returns Parsed Message object
     */

    const entry = mapping[entryId]
    const message = entry.message as RawMessage
    const rawContent = message.content as TextContent | MultimodalContent
    const chunks: Chunk[] = rawContent.parts.map((part) => {
        return {
            id: message.id,
            parts: [part],
        }
    })
    const attachments: (FileAttachment | ImageAttachment)[] =
        message.metadata.attachments || []

    return {
        id: entryId,
        parent: null,
        children: [],
        author: Author.USER,
        modelSlug: null,
        content: {
            chunks,
        },
        attachments,
    }
}

const validateAndExtractAssistantBranch = (
    childId: string,
    mapping: RawMapping
): RawEntry[] => {
    const rawEntries = []
    let currentChildId = childId
    let currentChild = mapping[currentChildId]
    while (
        currentChild &&
        currentChild.message?.author.role !== RawAuthorRole.USER
    ) {
        rawEntries.push(currentChild)
        if (currentChild.children.length === 0) {
            break
        } else if (currentChild.children.length !== 1) {
            currentChild.children.forEach((childId) => {
                const child = mapping[childId]
                if (child.message?.author.role !== RawAuthorRole.USER) {
                    const error = new AssistantBranchIsNonLinearError()
                    logger.error(
                        error.message,
                        `first non-linear child: ${childId}`
                    )
                }
            })
        }
        currentChildId = currentChild.children[0]
        currentChild = mapping[currentChildId]
    }
    return rawEntries
}

const mergeAssistantBranch = (rawEntries: RawEntry[]): Message => {
    /**
     * Merges an assistant branch into a single (assistant) Message object.
     * Since only assistant messages require merging (Dall-E image and code chunks), this function assumes the resultant Message is from the assistant.
     *
     * @param rawEntries - List of raw entries to merge
     * @returns Merged Message object
     * @throws NoAssistantMessageInRawMessageListError if no assistant message is found in the raw message list
     * @throws NoModelSlugInAssistantMessageError if no model slug is found in the first assistant message
     */

    // Map each raw message to a "Chunk"
    const chunks = rawEntries.map((rawEntry) => {
        const rawMessage = rawEntry.message as RawMessage
        if (
            rawMessage.content.content_type === RawContentType.TEXT ||
            rawMessage.content.content_type === RawContentType.MULTIMODAL
        ) {
            return {
                id: rawMessage.id,
                parts: rawMessage.content.parts,
            }
        } else if (
            rawMessage.content.content_type === RawContentType.EXECUTION_OUTPUT
        ) {
            return {
                id: rawMessage.id,
                parts: [
                    {
                        code: rawMessage.content.text,
                        output:
                            rawMessage.metadata.aggregate_result?.code || '',
                    },
                ],
            }
        } else {
            logger.error(
                `Unexpected content type ${rawMessage.content.content_type} made it to the merging phase. This implies an error in the filtering step. Skipping for now.`
            )
            return null
        }
    })

    const assistantEntries = rawEntries.filter(
        (rawEntry) => rawEntry.message?.author.role === RawAuthorRole.ASSISTANT
    )
    if (assistantEntries.length === 0) {
        const e = new NoAssistantMessageInRawMessageListError()
        logger.error(e.message)
        throw e
    }
    const firstAssistantEntry = assistantEntries[0]

    // the "id" of the final Message is the id of the first raw message from the assistant
    const id = firstAssistantEntry.id

    // the "modelSlug" field is the model slug of the first assistant message
    const slug = firstAssistantEntry.message?.metadata.model_slug

    if (!slug) {
        const e = new NoModelSlugInAssistantMessageError()
        logger.error(e.message)
        throw e
    }
    return {
        id,
        parent: null,
        children: [],
        author: Author.ASSISTANT,
        modelSlug: slug,
        content: {
            chunks: chunks as Chunk[],
        },
        attachments: [],
    }
}

export default parse
