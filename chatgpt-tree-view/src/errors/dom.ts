export class PromptInputFieldNotFoundError extends Error {
    constructor() {
        super(
            'Prompt input field not found. This implies some flakey behavior of the ChatGPT UI itself, because this element should always exist.'
        )
        this.name = 'PromptInputFieldNotFoundError'
    }
}

export class SendStopSpeechButtonNotFoundError extends Error {
    constructor() {
        super(
            'Send/Stop button not found. This implies some flakey behavior of the ChatGPT UI itself, because the page should always display one of the two.'
        )
        this.name = 'SendStopSpeechButtonNotFoundError'
    }
}

export class MainElementNotFoundError extends Error {
    constructor() {
        super(
            'Main element not found. This implies a crucial UI change in the ChatGPT UI. Please reach out to support.'
        )
        this.name = 'MainElementNotFoundError'
    }
}

export class BottomInputBarNotFoundError extends Error {
    constructor() {
        super(
            'Bottom input bar not found. This implies a crucial UI change in the ChatGPT UI. Please reach out to support.'
        )
        this.name = 'BottomInputBarNotFoundError'
    }
}
