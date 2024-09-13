import { SendStopButtonNotFoundError } from "../errors/dom"

const querySendStopButton = (parent: HTMLElement = document.body): [HTMLButtonElement, boolean] => {
    /**
     * Query the send button OR the stop button element.
     * It should never be null because it's always either one of the buttons.
     * @param {HTMLElement} parent The parent element to search within, defaults to the document body.
     * @returns {[HTMLButtonElement, boolean]} The send button OR the stop button element and a boolean indicating if it's the send button.
     * @throws {SendStopButtonNotFoundError} If neither the send button nor the stop button is found.
     */
    const sendButton = parent.querySelector('[data-testid="send-button"]')
    const stopButton = parent.querySelector('[data-testid="stop-button"]')

    if (!sendButton && !stopButton) {
        throw new SendStopButtonNotFoundError()
    }

    const finalButton = sendButton || stopButton
    const isSendButton = !!sendButton
    return [finalButton as HTMLButtonElement, isSendButton]
}

export default querySendStopButton