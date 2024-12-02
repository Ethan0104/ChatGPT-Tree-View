import queryBottomInputBar from '../query/bottom-input-bar'
import queryMainElement from '../query/main-element'

const toTreeView = () => {
    const root = document.querySelector(
        '[id="chatgpt-tree-view-root"]'
    ) as HTMLElement

    if (!root) {
        return
    }

    root.style.visibility = 'visible'
    root.style.pointerEvents = 'auto'

    const mainElement = queryMainElement()
    mainElement.style.visibility = 'hidden'
}

const closeTreeView = () => {
    const root = document.querySelector(
        '[id="chatgpt-tree-view-root"]'
    ) as HTMLElement

    if (!root) {
        return
    }

    root.style.visibility = 'hidden'
    root.style.pointerEvents = 'none'

    const mainElement = queryMainElement()
    mainElement.style.visibility = 'visible'
}

export { closeTreeView, toTreeView }
