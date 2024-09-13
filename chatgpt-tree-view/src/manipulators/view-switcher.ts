const showOrHideLinearMessages = (show: boolean) => {
    // hide all the conversation turns
    const convoTurns = document.querySelectorAll(
        "[data-testid^='conversation-turn-']"
    )
    convoTurns.forEach((turn) => {
        (turn as HTMLElement).style.display = show ? 'block' : 'none'
    })
    const convoTurnParent = convoTurns[0].parentNode as HTMLElement
    if (show) {
        convoTurnParent.classList.remove('h-full')
    } else {
        convoTurnParent.classList.add('h-full')
    }
}

export default showOrHideLinearMessages