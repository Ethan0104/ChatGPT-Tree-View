'use strict'

import {
    CHATGPT_DOMAIN,
    CHATGPT_OLD_DOMAIN,
    CONVERSATION_ENDPOINT,
    BEARER_TOKEN_COOKIE_NAME,
} from './constants/network'
import {
    checkDomain,
    maybeAddToConversationsCache,
    retrieveTreeResponse,
    captureRequestParams,
    extractConvoIdFromUrl,
} from './libs/network-utils'
import { logError } from './libs/logger'

// --- Caches ---
let headersCache = new Map([
    ['bearer', null],
    ['deviceId', null],
    ['languageHeader', 'en-US'], // XYZ - prone to change
])

let conversationsCache = new Map() // key: conversationId, value: title

// --- Event Listeners (from Content Script) ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'request-tree') {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                const activeTab = tabs[0]
                const url = activeTab.url

                const conversationId = extractConvoIdFromUrl(url)
                retrieveTreeResponse(conversationId, headersCache)
                    .then((treeResponse) => {
                        // send message to content script to open the tree view
                        console.log('sending message to content script')
                        chrome.tabs.sendMessage(activeTab.id, {
                            action: 'render-tree',
                            treeResponse: treeResponse,
                        })
                    })
                    .catch((error) => {
                        logError('Failed to retrieve tree response: ', error)
                    })
            }
        )
    }
})

// --- Event Listeners (Other) ---
chrome.tabs.onActivated.addListener((activeInfo) => {
    const tabId = activeInfo.tabId

    // chrome.tabs.get(tabId, (tab) => {
    //     if (checkDomain(tab.url)) {
    //         maybeAddToConversationsCache(conversationsCache, tab)

    //         if (checkIfCanMakeConvoHistoryRequest(headersCache)) {
    //             makeConvoHistoryRequest("6c9fbbe7-2690-4fab-bc75-64656ad79947", headersCache.bearer, headersCache.deviceId, headersCache.languageHeader).then((response) => {
    //                 if (!response.ok) {
    //                     throw new Error('Network response was not ok ' + response.statusText);
    //                 }
    //                 return response.json()
    //             }).then((data) => {
    //                 console.log("convo")
    //                 console.log(data)
    //                 console.log(typeof data)
    //             }).catch((error) => {
    //                 console.error(error)
    //             })
    //         }
    //     }
    // })
})

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (checkDomain(tab.url)) {
//         getNecessaryCookies().then(([bearer, deviceId]) => {
//             console.log("updated", [bearer, deviceId])
//             cache.set("bearer", bearer)
//         }).catch((error) => {
//             console.error(error)
//         })
//     }
// })

chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        captureRequestParams(details, headersCache)
    },
    { urls: ['<all_urls>'] },
    ['requestHeaders']
)

chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        console.log(details)
    },
    { urls: [`${CHATGPT_DOMAIN}${CONVERSATION_ENDPOINT}/*-*-*-*-*`] },
    ['requestHeaders']
)
