import { BottomInputBarNotFoundError } from '../errors/dom'

const queryBottomInputBar = (): HTMLDivElement => {
    /**
     * Queries the DOM for the bottom input bar.
     * @returns {HTMLDivElement} The bottom input bar.
     * @throws {BottomInputBarNotFoundError} If the bottom input bar is not found.
     */
    const bottomInputBar = document.querySelector('[id="composer-background"]') // XYZ - prone to change
    if (!bottomInputBar) {
        throw new BottomInputBarNotFoundError()
    }
    return bottomInputBar as HTMLDivElement
}

export default queryBottomInputBar
