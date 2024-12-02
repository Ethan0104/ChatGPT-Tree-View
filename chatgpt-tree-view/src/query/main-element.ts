import { MainElementNotFoundError } from '../errors/dom'

const queryMainElement = (): HTMLElement => {
    /**
     * Query the main element that contains the conversation turns.
     * @returns {HTMLElement} The main element that contains the conversation turns.
     * @throws {MainElementNotFoundError} If the main element is not found.
     */
    const mainElement = document.querySelectorAll('main')
    if (!mainElement) {
        throw new MainElementNotFoundError()
    }
    // should only have one main element, but if we get multiple, choose the one with the greatest height
    if (mainElement.length === 1) {
        return mainElement[0] as HTMLElement
    }
    let maxHeight = 0
    let maxElement = mainElement[0] as HTMLElement
    mainElement.forEach((element) => {
        const height = element.clientHeight
        if (height > maxHeight) {
            maxHeight = height
            maxElement = element as HTMLElement
        }
    })
    return maxElement
}

export default queryMainElement
