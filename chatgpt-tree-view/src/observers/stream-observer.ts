import { log } from 'console'
import logger from '../logger'
import querySendStopButton from '../query/send-stop'

// MutationObserver for observing the streaming response from ChatGPT,
// triggering an event when an Assistant message starts AND finishes sending
const streamObserver = new MutationObserver((mutations) => {
    logger.info('streamObserver', mutations)
    // because this observer obvers for the childList of the parent of the sendStopButton,
    // the mutations list should have length 2, and the 1st mutation is the removal of the old button,
    // and the 2nd mutation is the addition of the new button
    if (mutations.length !== 2) {
        return
    }
    if (mutations[0].removedNodes.length === 0 || mutations[1].addedNodes.length === 0) {
        return
    }
    const removed = mutations[0].removedNodes[0] as Element
    const added = mutations[1].addedNodes[0] as Element

    // find the button element for both removed and added, note, the button element can either be the removed/added element or a descendant of the removed/added element
    // therefore, if the removed/added element is the button itself, we can directly use it, otherwise, we need to query the button element
    const oldButton = removed.tagName === 'BUTTON' ? removed : removed.querySelector('button') as Element
    const newButton = added.tagName === 'BUTTON' ? added : added.querySelector('button') as Element
    if (!oldButton || !newButton) {
        return
    }
    
    // since mutations can happen because of 1. message stream start/stop 2. user typing (btn changing activeness),
    // we only care when the data-testids are different
    const oldButtonTestId = oldButton.getAttribute('data-testid')
    const newButtonTestId = newButton.getAttribute('data-testid')
    if (oldButtonTestId === newButtonTestId) {
        return
    }

    if (oldButtonTestId == "send-button" && newButtonTestId == "stop-button") {
        const event = new Event('assistant-message-started')
        chrome.runtime.sendMessage({ action: 'assistant-message-started' })
    } else if (oldButtonTestId == "stop-button" && newButtonTestId == "send-button") {
        const event = new Event('assistant-message-finished')
        window.dispatchEvent(event)
        chrome.runtime.sendMessage({ action: 'assistant-message-finished' })
        logger.info('MSG SENT')
    }
})

const streamObserverStart = () => {
    const [sendStopButton] = querySendStopButton()
    streamObserver.observe(sendStopButton.parentElement?.parentElement as Node, {
        childList: true,
        subtree: true,
    })
}

const streamObserverStop = () => {
    streamObserver.disconnect()
}

export { streamObserverStart, streamObserverStop }