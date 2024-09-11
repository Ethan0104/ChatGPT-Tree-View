export class PromptInputFieldNotFoundError extends Error {
    constructor() {
        super('Prompt input field not found. This implies some flakey behavior of the ChatGPT UI itself, because this element should always exist.')
        this.name = 'PromptInputFieldNotFoundError'
    }
}