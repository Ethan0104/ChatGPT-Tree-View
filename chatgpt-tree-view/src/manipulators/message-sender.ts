import { PromptInputFieldNotFoundError } from '../errors/dom'
import logger from '../logger'
import queryInputtablePromptField from '../query/prompt-field'
import querySendStopSpeechButton from '../query/send-stop'

const sendNewMessage = (message: string) => {
    try {
        // if the message ends with a \n, remove one trailing \n only
        if (message.endsWith('\n')) {
            message = message.slice(0, -1)
        }

        const promptField = queryInputtablePromptField()
        promptField.innerHTML = `<p>${message}</p>` // XYZ - prone to change

        let sendStopButton = null

        // poll for the sendStopButton to be enabled
        const interval = setInterval(() => {
            sendStopButton = querySendStopSpeechButton()[0]
            if (!sendStopButton.disabled) {
                sendStopButton.click()
                clearInterval(interval)
            }
        }, 50)
    } catch (error) {
        if (error instanceof PromptInputFieldNotFoundError) {
            logger.error(
                'Prompt input field not found. This implies some flakey behavior of the ChatGPT UI itself, because this element should always exist.'
            )
        } else {
            logger.error('Error sending new message:', error)
            throw error
        }
    }
}

export default sendNewMessage
