import RawEntry from '../models/raw-entry'
import RawMapping from '../models/raw-mapping'
import { RawAuthorRole, RawAuthorName } from '../models/raw-author'
import { RawContentType } from '../models/raw-content'

const isEntryHidden = (entry: RawEntry): boolean => {
    const msg = entry.message
    // Root message is always 'visible', here are 2 checks for this
    if (msg === null) return false
    if (entry.parent === null) return false

    if (
        // obvious
        msg.metadata.is_visually_hidden_from_conversation ||
        // user memories
        msg.content.content_type === RawContentType.MODEL_EDITABLE_CONTEXT ||
        // file summary
        msg.content.content_type === RawContentType.TETHER_QUOTE ||
        // bio is a message that says memory is updated, and myfiles_browser is same as above, just a file summary
        (msg.author.role === RawAuthorRole.TOOL &&
            (msg.author.name === RawAuthorName.BIO ||
                msg.author.name === RawAuthorName.FILE_BROWSER)) ||
        // system messages
        msg.author.role === RawAuthorRole.SYSTEM ||
        // the prompt for Dall-E sent by the assistant
        (msg.author.role === RawAuthorRole.ASSISTANT &&
            msg.recipient === RawAuthorName.DALLE) ||
        // the assistant trying to update memory
        (msg.author.role === RawAuthorRole.ASSISTANT &&
            msg.recipient === RawAuthorName.BIO) ||
        // dall-e spitting the prompt back
        (msg.author.role === RawAuthorRole.TOOL &&
            msg.author.name === RawAuthorName.DALLE &&
            msg.content.content_type === RawContentType.TEXT) ||
        // assistant sends code to python runner (visible but delete because the execution output message contains the code)
        (msg.author.role === RawAuthorRole.ASSISTANT &&
            msg.recipient === RawAuthorName.PYTHON &&
            msg.content.content_type === RawContentType.CODE)
    ) {
        return true
    }
    return false
}

const filterHiddenEntries = (mapping: RawMapping) => {
    // modify the mapping in place
    for (const entryId in mapping) {
        const entry = mapping[entryId]
        if (isEntryHidden(entry)) {
            // remove the entry from the children of its parent
            const parent = entry.parent
            if (parent !== null) {
                const parentEntry = mapping[parent]
                parentEntry.children = parentEntry.children.filter((childId) => childId !== entryId)
            }
            // make the parent of this entry's children entries to be this entry's parent
            for (const childId of entry.children) {
                const childEntry = mapping[childId]
                childEntry.parent = parent
            }
            // remove the entry from the mapping
            delete mapping[entryId]
        }
    }
}
