// class Author {
//     constructor(rawAuthor) {
//         this.role = rawAuthor.role
//         this.name = rawAuthor.name
//     }
// }

// class Content {
//     constructor(rawContent) {
//         this.contentType = rawContent.content_type

//         this.parts = []
//         this.code = null
//         this.executionOutput = null
//         switch (this.contentType) {
//             case 'text':
//             case 'multimodal_text':
//                 this.parts = rawContent.parts.map((part) => new ContentPart(part))
//                 break
//             case 'code':
//                 this.code = rawContent.text
//                 break
//             case 'execution_output':
//                 this.executionOutput = rawContent.text
//                 break
//             case 'model_editable_context':
//             case 'tether_quote':
//                 break
//             default:
//                 throw new Error(`Unknown content type: ${this.contentType}`)
//         }
//     }
// }

// class ContentPart {
//     constructor(part) {
//         this.text = null
//         this.fileId = null
//         if (typeof part === 'string') {
//             this.text = part
//         } else if (typeof part === 'object') {
//             if (part.content_type != "image_asset_pointer") {
//                 throw new Error("Assertion Error: Invalid content type in multimodal_text, expected image_asset_pointer")
//             }
//             this.fileId = part.asset_pointer.replace("file-service://", "")
//         }
//     }
// }

// class MessageMeta {
//     constructor(rawMeta) {
//         this.visuallyHidden = rawMeta.is_visually_hidden_from_conversation || false
//         this.messageType = rawMeta.message_type
//         this.attachments = rawMeta.attachments || []
//         this.modelSlug = rawMeta.model_slug || null
//     }
// }

const CONTENT_PART_TYPES = {
    TEXT: 'text',
    CODE: 'code',
    IMAGE: 'image',
    FILE: 'file',
}

class ContentPart {
    constructor(type, value, mimeType = null) {
        this.type = type // one of the CONTENT_PART_TYPES
        this.value = value // string (text or fileId) or object with keys 'code' and 'result' (for code)
        this.mimeType = mimeType // mainly used for displaying the icon of the file
    }
}

class UserMessage {
    constructor(chunks) {
        this.chunks = chunks // array of ContentPart
    }
}

class AssistantReply {
    constructor(chunks, author) {
        this.chunks = chunks // array of ContentPart
        this.author = author // the model that generated this reply, one of the elements in MODEL_TYPES
    }
}

export {
    ContentPart,
    CONTENT_PART_TYPES,
    UserMessage,
    AssistantReply,
}
