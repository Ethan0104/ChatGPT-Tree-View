type FileId = string

type TextPart = string

type ImagePart = {
    asset_pointer: FileId
    width: number
    height: number
}

type CodePart = {  // my own type, not in raw response
    code: string
    output: string
}

type Chunk = {  // for merged messages, when rendered, just flatten the 2d array
    id: string
    parts: (TextPart | ImagePart | CodePart)[]
}

interface Content {
    chunks: Chunk[]
}

export { FileId, TextPart, ImagePart, CodePart, Content }
