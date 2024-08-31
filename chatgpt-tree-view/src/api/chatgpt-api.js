import axios from 'axios'
import logger from '../logger'

const chatgptApi = axios.create({
    baseURL: 'https://chatgpt.com/backend-api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// get one of the request headers from the local storage, returns null if not found
const getHeaderFromLocal = async (header) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([header], (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError)
            }
            resolve(result[header] || null)
        })
    })
}

// Request interceptor to add the necessary headers to the requests
chatgptApi.interceptors.request.use(
    async (config) => {
        try {
            const token = await getHeaderFromLocal('jwtToken')
            const deviceId = await getHeaderFromLocal('deviceId')
            const language = await getHeaderFromLocal('languageHeader')
            if (token && deviceId) {
                config.headers.Authorization = token
                config.headers['Oai-device-id'] = deviceId
                config.headers['Oai-Language'] = language || 'en-US'
                return config
            } else {
                throw new Error(`JWT Token or Device Id not found in local storage: ${token}, ${deviceId}`)
            }
        } catch (error) {
            logger.error(
                'Error attaching JWT and Device Id to request:',
                error
            )
            return Promise.reject(error) // Reject the request if the storage isn't primed
        }
    },
    (error) => {
        return Promise.reject(error)
    }
)

chatgptApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // TODO: Handle error responses accordingly
        logger.error('Error in API request:', error)
        return Promise.reject(error)
    }
)

// --- API Request Functions ---
export const fetchConversationHistory = async (conversationId) => {
    const response = await chatgptApi.get(`/conversation/${conversationId}`)
    return response.data
}

export const requestReplyForUser = async () => {
    const conversationId = '36b8b969-d657-4f76-8581-be9119d4c55f'
    const messageId = crypto.randomUUID()
    const parentId = 'aca28471-4914-48bf-b02d-dc784ea91fe6'
    const payload = {
        action: 'next',
        conversation_id: conversationId,
        conversation_mode: {
            kind: 'primary_assistant',
            plugin_ids: null,
        },
        conversation_origin: null,
        force_nulligen: false,
        force_paragen: false,
        force_paragen_model_slug: "",
        force_rate_limit: false,
        force_use_sse: true,
        history_and_training_disabled: false,
        messages: [
            {
                id: messageId,
                author: {
                    role: 'user',
                },
                content: {
                    content_type: 'text',
                    parts: ['Hello, how are you doing today?'],
                },
                metadata: {},
                create_time: new Date() / 1000,
            }
        ],
        model: 'gpt-4o',
        parent_message_id: parentId,
        reset_rate_limits: false,
        suggestions: [],
        system_hints: [],
        timezone_offset_min: 240,
        websocket_request_id: crypto.randomUUID(),
    }
    const response = await chatgptApi.post('/conversation', payload, {
        headers: {
            'Accept': 'text/event-stream',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en,de-DE;q=0.9,de;q=0.8,en-US;q=0.7,zh-CN;q=0.6,zh;q=0.5,ja;q=0.4',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://chatgpt.com',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'Referer': `https://chatgpt.com/c/${conversationId}`,
        },
    })
    logger.info('Reply for user:', response)
}
