import { RawAuthor } from './raw-author'
import {
    TextContent,
    MultimodalContent,
    CodeContent,
    ExecutionOutputContent,
    MemoryContent,
    TetherQuoteContent,
} from './raw-content'
import { RawMetadata } from './raw-metadata'

interface RawMessage {
    id: string
    author: RawAuthor
    content:
        | TextContent
        | MultimodalContent
        | CodeContent
        | ExecutionOutputContent
        | MemoryContent
        | TetherQuoteContent
    metadata: RawMetadata
    recipient: string
}

export default RawMessage
