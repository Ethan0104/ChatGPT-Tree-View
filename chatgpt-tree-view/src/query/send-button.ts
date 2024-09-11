const querySendButton = (): HTMLButtonElement | null => {
    /**
     * Query the send button element.
     * It may be null because the send button can be replaced by the stop-button when the model is generating a response.
     * @returns {HTMLButtonElement | null} The send button element if found, otherwise null.
     */
    return document.querySelector<HTMLButtonElement>('[data-testid="send-button"]');
}

export default querySendButton