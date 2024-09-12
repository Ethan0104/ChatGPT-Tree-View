const showOrHideLinearMessages = (show: boolean) => {
    // hide all the conversation turns
    const convoTurns = document.querySelectorAll(
        "[data-testid^='conversation-turn-']"
    )
    convoTurns.forEach((turn) => {
        (turn as HTMLElement).style.display = show ? 'block' : 'none'
    })
}

export default showOrHideLinearMessages