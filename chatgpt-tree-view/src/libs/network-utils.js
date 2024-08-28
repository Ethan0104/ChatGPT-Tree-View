import {
    CHATGPT_DOMAIN,
    CHATGPT_OLD_DOMAIN,
    BEARER_TOKEN_COOKIE_NAME,
    OAI_DEVICE_ID_COOKIE_NAME,
    CONVO_HISTORY_ENDPOINT_REGEX,
    AUTHORIZATION_HEADER_NAME,
    OAI_DEVICE_ID_HEADER_NAME,
    OAI_LANGUAGE_HEADER_NAME,
} from '../constants/network'
import { logError } from './logger'

function checkDomain(url) {
    return url.startsWith(CHATGPT_DOMAIN) || url.startsWith(CHATGPT_OLD_DOMAIN)
}

function maybeAddToConversationsCache(conversationsCache, tab) {
    const convoId = extractConvoIdFromUrl(tab.url)
    if (!conversationsCache.has(convoId)) {
        const title = tab.title
        conversationsCache.set(convoId, title)
    }
}

function extractConvoIdFromUrl(url) {
    return url.split('/').pop()
}

function getCookie(cookieName) {
    return new Promise((resolve, reject) => {
        chrome.cookies.get(
            { url: CHATGPT_DOMAIN, name: cookieName },
            (cookie) => {
                if (cookie) {
                    resolve(cookie.value)
                } else {
                    reject(new Error('Cookie not found'))
                }
            }
        )
    })
}

async function retrieveTreeResponse(conversationId, headersCache) {
    if (!checkIfCanMakeConvoHistoryRequest(headersCache)) {
        // send message to content script to get the headers
        throw new Error(
            'header cache not ready, because no requests were captured yet.'
        )
    }

    const response = await makeConvoHistoryRequest(
        conversationId,
        headersCache.bearer,
        headersCache.deviceId,
        headersCache.languageHeader
    )
    const responseJson = await response.json()
    return responseJson
}

function makeConvoHistoryRequest(
    conversationId,
    bearerToken,
    deviceId,
    languageHeader
) {
    const url = `https://chatgpt.com/backend-api/conversation/${conversationId}`
    const headers = {
        Authorization: bearerToken,
        'Oai-device-id': deviceId,
        'Oai-Language': languageHeader,
    }
    return fetch(url, { headers })
}

function checkIfCanMakeConvoHistoryRequest(headersCache) {
    return (
        headersCache.bearer &&
        headersCache.deviceId &&
        headersCache.languageHeader
    )
}

function captureRequestParams(details, headersCache) {
    try {
        const headers = details.requestHeaders
        const bearerHeader = headers.find(
            (header) => header.name === AUTHORIZATION_HEADER_NAME
        )
        const deviceIdHeader = headers.find(
            (header) => header.name === OAI_DEVICE_ID_HEADER_NAME
        )
        const languageHeader = headers.find(
            (header) => header.name === OAI_LANGUAGE_HEADER_NAME
        )
        if (bearerHeader) {
            headersCache.bearer = bearerHeader.value
        }
        if (deviceIdHeader) {
            headersCache.deviceId = deviceIdHeader.value
        }
        if (languageHeader) {
            headersCache.languageHeader = languageHeader.value
        }
    } catch (error) {
        logError('Error capturing request params', error)
    }
}

export {
    checkDomain,
    maybeAddToConversationsCache,
    captureRequestParams,
    retrieveTreeResponse,
    extractConvoIdFromUrl,
}
