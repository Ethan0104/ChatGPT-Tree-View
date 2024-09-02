import { ImagePart, TextPart } from './content'

enum RawContentType {
    TEXT = 'text',
    MULTIMODAL = 'multimodal_text',
    MODEL_EDITABLE_CONTEXT = 'model_editable_context', // user memories
    TETHER_QUOTE = 'tether_quote', // file summary
    CODE = 'code',
    EXECUTION_OUTPUT = 'execution_output',
}

interface TextContent {
    content_type: RawContentType.TEXT
    parts: TextPart[]
}

interface MultimodalContent {
    content_type: RawContentType.MULTIMODAL
    parts: (TextPart | ImagePart)[]
}

interface CodeContent {
    content_type: RawContentType.CODE
    text: string
}

interface ExecutionOutputContent {
    content_type: RawContentType.EXECUTION_OUTPUT
    text: string
}

interface MemoryContent {
    content_type: RawContentType.MODEL_EDITABLE_CONTEXT
}

interface TetherQuoteContent {
    content_type: RawContentType.TETHER_QUOTE
}

export {
    RawContentType,
    TextContent,
    MultimodalContent,
    CodeContent,
    ExecutionOutputContent,
    MemoryContent,
    TetherQuoteContent,
}
