import queryInputtablePromptField from "../query/prompt-field"
import { PromptInputFieldNotFoundError } from "../errors/dom"
import querySendStopButton from "../query/send-stop"

const sendNewMessage = (message: string) => {
    try {
        // if the message ends with a \n, remove one trailing \n only
        if (message.endsWith('\n')) {
            message = message.slice(0, -1)
        }

        const promptField = queryInputtablePromptField()
        promptField.innerHTML = `<p>${message}</p>` // XYZ - prone to change

        const [sendStopButton] = querySendStopButton()
        // sendStopButton.click()
    } catch (error) {
        if (error instanceof PromptInputFieldNotFoundError) {
            console.error('Prompt input field not found. This implies some flakey behavior of the ChatGPT UI itself, because this element should always exist.')
        } else {
            throw error
        }
    }
}

export default sendNewMessage