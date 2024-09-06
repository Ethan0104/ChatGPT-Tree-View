import ModelSlug from './model-slug'
import RawMapping from './raw-mapping'

interface ConversationResponse {
    title: string
    mapping: RawMapping
    current_node: string
    conversation_id: string
    is_archived: boolean
    default_model_slug: ModelSlug
}

export default ConversationResponse
