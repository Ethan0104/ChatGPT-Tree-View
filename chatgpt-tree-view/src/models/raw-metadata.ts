import { FileAttachment, ImageAttachment } from './attachment'
import ModelSlug from './model-slug'

interface RawMetadata {
    model_slug?: ModelSlug // always not null if the message is from the assistant
    aggregate_result?: {
        // always not null if the message is of type execution_output
        code: string
    }
    attachments?: (FileAttachment | ImageAttachment)[]
    is_visually_hidden_from_conversation?: boolean
}

export { RawMetadata }
