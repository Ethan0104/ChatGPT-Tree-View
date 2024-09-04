interface FileAttachment {
    id: string
    name: string
    mime_type: string // TODO: use an enum
}

interface ImageAttachment {
    id: string
    name: string
    mime_type: string // TODO: use an enum
    width: number
    height: number
}

export { FileAttachment, ImageAttachment }
