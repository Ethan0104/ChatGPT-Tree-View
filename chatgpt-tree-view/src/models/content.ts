type FileId = string

type TextPart = string

type ImagePart = {
    asset_pointer: FileId
    width: number
    height: number
}

// for the data analyzer code snippets ONLY, normal code snippets just exist in the markdown itself
type CodePart = {
    // my own type, not in raw response
    code: string
    output: string
}

type Chunk = {
    // for merged messages, when rendered, just flatten the 2d array
    id: string
    parts: (TextPart | ImagePart | CodePart)[]
}

interface Content {
    chunks: Chunk[]
}

export { FileId, TextPart, ImagePart, CodePart, Chunk, Content }
