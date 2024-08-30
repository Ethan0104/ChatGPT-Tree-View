import axios from 'axios'
import logger from '../logger'

const chatgptApi = axios.create({
    baseURL: 'https://chatgpt.com/backend-api',
    timeout: 10000,
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
                config.headers['Oai-Language'] = language
                return config
            } else {
                throw new Error(
                    `JWT token, Device ID, or Language Header not found, token: ${token}, device id: ${deviceId}, language: ${language}`
                )
            }
        } catch (error) {
            console.error(
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
        return Promise.reject(error)
    }
)

// --- API Request Functions ---
export const fetchConversationHistory = async (conversationId) => {
    const response = await chatgptApi.get(`/conversation/${conversationId}`)
    return response.data
}
