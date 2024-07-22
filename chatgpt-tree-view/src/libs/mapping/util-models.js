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

class ContentPart {
    constructor(type, value, mimeType = null) {
        this.type = type
        this.value = value // string (text or fileId) or list [code, executionOutput]
        this.mimeType = mimeType
    }
}

export { ContentPart }
