const CHATGPT_DOMAIN = 'https://chatgpt.com' // XYZ - prone to change
const CHATGPT_OLD_DOMAIN = 'https://chat.openai.com'
const CONVERSATION_ENDPOINT = '/backend-api/conversation' // XYZ - prone to change

// Example: https://chatgpt.com/backend-api/conversation/20c541d1-d6bb-4b1e-a06e-b8c67073e4be
const UUID_REGEX =
    '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'
const CONVO_HISTORY_ENDPOINT_REGEX = new RegExp(
    `${CHATGPT_DOMAIN}${CONVERSATION_ENDPOINT}/${UUID_REGEX}`
) // XYZ - prone to change

const AUTHORIZATION_HEADER_NAME = 'Authorization'
const OAI_DEVICE_ID_HEADER_NAME = 'OAI-Device-Id' // XYZ - prone to change
const OAI_LANGUAGE_HEADER_NAME = 'OAI-Language' // XYZ - prone to change

const BEARER_TOKEN_COOKIE_NAME = '__Secure-next-auth.session-token' // XYZ - prone to change
const OAI_DEVICE_ID_COOKIE_NAME = 'oai-did' // XYZ - prone to change

export {
    AUTHORIZATION_HEADER_NAME,
    BEARER_TOKEN_COOKIE_NAME,
    CHATGPT_DOMAIN,
    CHATGPT_OLD_DOMAIN,
    CONVERSATION_ENDPOINT,
    CONVO_HISTORY_ENDPOINT_REGEX,
    OAI_DEVICE_ID_COOKIE_NAME,
    OAI_DEVICE_ID_HEADER_NAME,
    OAI_LANGUAGE_HEADER_NAME,
}
