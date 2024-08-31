'use strict'

import {
    CHATGPT_DOMAIN,
    CONVERSATION_ENDPOINT,
} from './constants/network'
import { captureRequestParams, extractConvoIdFromUrl } from './utils/network'
import { fetchConversationHistory, requestReplyForUser } from './api/chatgpt-api'
import logger from './logger'


// --- Event Listeners (from Content Script) ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'request-tree') {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            async function (tabs) {
                const activeTab = tabs[0]
                const url = activeTab.url

                const conversationId = extractConvoIdFromUrl(url)
                try {
                    const treeResponse = await fetchConversationHistory(
                        conversationId
                    )
                    
                    // send message to content script to open the tree view
                    chrome.tabs.sendMessage(activeTab.id, {
                        action: 'render-tree',
                        treeResponse: treeResponse,
                    })
                } catch (error) {
                    logger.error(
                        'Failed to retrieve tree response, reason: ',
                        error.message
                    )
                    chrome.tabs.sendMessage(activeTab.id, {
                        action: 'tree-fetch-failed',
                        error: error.message,
                    })
                }
            }
        )
    }
})

// --- Event Listeners (Network Notetakers) ---
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        captureRequestParams(details)
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

chrome.runtime.onInstalled.addListener((details) => {
    if (
        details.reason === 'install' ||
        details.reason === 'update' ||
        details.reason === 'chrome_update'
    ) {
        // Clear local storage
        chrome.storage.local.clear(() => {
            if (chrome.runtime.lastError) {
                console.error(
                    'Error clearing local storage:',
                    chrome.runtime.lastError
                )
            } else {
                console.log('Local storage cleared on extension install/update')
            }
        })
    }
})
