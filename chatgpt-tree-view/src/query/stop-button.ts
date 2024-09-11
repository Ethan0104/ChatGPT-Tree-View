const queryStopButton = (): HTMLButtonElement | null => {
    /**
     * Query the stop button element.
     * It may be null because the stop button can be replaced by the send-button when the model is not generating a response.
     * @returns {HTMLButtonElement | null} The stop button element if found, otherwise null.
     */
    return document.querySelector<HTMLButtonElement>('[data-testid="stop-button"]')
}