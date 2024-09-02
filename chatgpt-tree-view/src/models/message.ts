import Author from "./author"
import { Content } from "./content"
import ModelSlug from "./model-slug"

interface Message {
    id: string
    parent: Message | null
    children: Message[]

    author: Author
    modelSlug: ModelSlug | null  // null if it is a user message
    content: Content
}

export default Message