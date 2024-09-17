import queryInputtablePromptField from "../query/prompt-field"
import { PromptInputFieldNotFoundError } from "../errors/dom"
import querySendStopButton from "../query/send-stop"
import logger from "../logger"

const sendNewMessage = (message: string) => {
    try {
        // if the message ends with a \n, remove one trailing \n only
        if (message.endsWith('\n')) {
            message = message.slice(0, -1)
        }

        const promptField = queryInputtablePromptField()
        promptField.innerHTML = `<p>${message}</p>` // XYZ - prone to change

        const [sendStopButton] = querySendStopButton()
        // log whether if the sendStopButton is disabled
        // if (sendStopButton.disabled) {
        //     console.warn('Send button is disabled. This implies some flakey behavior of the ChatGPT UI itself, because this button should always be enabled.')
        // } else {
        //     console.info('Send button is enabled.')
        // }
        // sendStopButton.click()

        // poll for the sendStopButton to be enabled
        const interval = setInterval(() => {
            if (!sendStopButton.disabled) {
                sendStopButton.click()
                clearInterval(interval)
            }
        }, 50)
    } catch (error) {
        if (error instanceof PromptInputFieldNotFoundError) {
            logger.error('Prompt input field not found. This implies some flakey behavior of the ChatGPT UI itself, because this element should always exist.')
        } else {
            logger.error('Error sending new message:', error)
            throw error
        }
    }
}

export default sendNewMessage