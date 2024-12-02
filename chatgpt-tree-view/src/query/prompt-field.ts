import { PromptInputFieldNotFoundError } from '../errors/dom'

const queryInputtablePromptField = (): HTMLTextAreaElement => {
    /**
     * Queries the DOM for the main prompt field, specifically the textarea element.
     * @returns {HTMLTextAreaElement} The textarea element that holds the main prompt.
     * @throws {PromptInputFieldNotFoundError} If the prompt field is not found.
     */
    const promptField = document.querySelector('[id="prompt-textarea"]') // XYZ - prone to change
    if (!promptField) {
        throw new PromptInputFieldNotFoundError()
    }
    return promptField as HTMLTextAreaElement
}

export default queryInputtablePromptField
