'use strict'

import { fetchConversationHistory } from './api/chatgpt-api'
import { CHATGPT_DOMAIN } from './constants/network'
import logger from './logger'
import { captureRequestParams, extractConvoIdFromUrl } from './utils/network'

// --- Event Listeners (from Content Script) ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'request-tree') {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            async function (tabs) {
                const activeTab = tabs[0]
                const url = activeTab.url
                if (!activeTab.id || !url) {
                    return
                }

                const conversationId = extractConvoIdFromUrl(url)
                if (!conversationId) {
                    logger.error('Failed to extract conversation ID from URL')
                    chrome.tabs.sendMessage(activeTab.id, {
                        action: 'tree-fetch-failed',
                        error: 'Failed to extract conversation ID from URL',
                    })
                    return
                }
                try {
                    const treeResponse = await fetchConversationHistory(
                        conversationId
                    )

                    // send message to content script to open the tree view
                    chrome.tabs.sendMessage(activeTab.id, {
                        action: 'register-updated-tree',
                        treeResponse: treeResponse,
                    })
                } catch (error) {
                    const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error'
                    logger.error(
                        'Failed to retrieve tree response, reason: ',
                        errorMessage
                    )
                    chrome.tabs.sendMessage(activeTab.id, {
                        action: 'tree-fetch-failed',
                        error: errorMessage,
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
    { urls: [`${CHATGPT_DOMAIN}/*`] },
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
