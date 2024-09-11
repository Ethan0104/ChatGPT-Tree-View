import queryInputtablePromptField from "../query/prompt-field"
import { PromptInputFieldNotFoundError } from "../errors/dom"

const sendNewMessage = (message: string) => {
    try {
        const promptField = queryInputtablePromptField()
        promptField.value = message
    } catch (error) {
        if (error instanceof PromptInputFieldNotFoundError) {
            console.error('Prompt input field not found. This implies some flakey behavior of the ChatGPT UI itself, because this element should always exist.')
        } else {
            throw error
        }
    }
}

export default sendNewMessage