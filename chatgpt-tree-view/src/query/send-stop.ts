import { SendStopSpeechButtonNotFoundError } from '../errors/dom'

const querySendStopSpeechButton = (
    parent: HTMLElement = document.body
): [HTMLButtonElement, number] => {
    /**
     * Query the send button, the stop button element, OR the speech button.
     * It should never be null because it's always either one of the buttons.
     * @param {HTMLElement} parent The parent element to search within, defaults to the document body.
     * @returns {[HTMLButtonElement, number]} The found button element and a number, 0 if it's the send button, 1 if it's the stop button, 2 if it's the speech button.
     * @throws {SendStopSpeechButtonNotFoundError} If neither the send button nor the stop button is found.
     */
    const sendButton = parent.querySelector('[data-testid="send-button"]')
    const stopButton = parent.querySelector('[data-testid="stop-button"]')
    const speechButton = parent.querySelector(
        '[data-testid="composer-speech-button"]'
    )

    if (!sendButton && !stopButton && !speechButton) {
        throw new SendStopSpeechButtonNotFoundError()
    }

    const finalButton = sendButton || stopButton || speechButton
    const whichButton = sendButton ? 0 : stopButton ? 1 : 2
    return [finalButton as HTMLButtonElement, whichButton]
}

export default querySendStopSpeechButton
