import {
    AUTHORIZATION_HEADER_NAME,
    CHATGPT_DOMAIN,
    CHATGPT_OLD_DOMAIN,
    OAI_DEVICE_ID_HEADER_NAME,
    OAI_LANGUAGE_HEADER_NAME,
} from '../constants/network'
import logger from '../logger'

export const extractConvoIdFromUrl = (url: string) => {
    return url.split('/').pop()
}

export const checkDomain = (url: string) => {
    return url.startsWith(CHATGPT_DOMAIN) || url.startsWith(CHATGPT_OLD_DOMAIN)
}

export const captureRequestParams = (
    details: chrome.webRequest.WebRequestHeadersDetails
) => {
    try {
        const headers = details.requestHeaders
        if (!headers) {
            return
        }
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
            chrome.storage.local.set({ jwtToken: bearerHeader.value })
        }
        if (deviceIdHeader) {
            chrome.storage.local.set({ deviceId: deviceIdHeader.value })
        }
        if (languageHeader) {
            chrome.storage.local.set({ languageHeader: languageHeader.value })
        }

        chrome.storage.local.get(
            ['jwtToken', 'deviceId', 'languageHeader'],
            (result) => {
                console.log('Captured request params:', result)
            }
        )
    } catch (error) {
        logger.error('Error capturing request params', error)
    }
}
