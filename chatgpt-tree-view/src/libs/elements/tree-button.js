function getTopRight2ButtonsFlexboxDiv() {
    // XYZ - prone to change
    const largeViewDiv = document.querySelector(
        '#__next > div.relative.z-0.flex.h-full.w-full.overflow-hidden > div.relative.flex.h-full.max-w-full.flex-1.flex-col.overflow-hidden > main > div.flex.h-full.flex-col.focus-visible\\:outline-0 > div.flex-1.overflow-hidden > div > div > div > div > div.sticky.top-0.p-3.mb-1\\.5.flex.items-center.justify-between.z-10.h-14.font-semibold.bg-token-main-surface-primary > div.flex.gap-2.pr-1'
    )
    const smallViewDiv = document.querySelector(
        '#__next > div.relative.z-0.flex.h-full.w-full.overflow-hidden > div > div.sticky.top-0.z-10.flex.min-h-\\[40px\\].items-center.justify-center.border-b.border-token-border-medium.bg-token-main-surface-primary.pl-1.juice\\:min-h-\\[60px\\].juice\\:border-transparent.juice\\:pl-0.md\\:hidden > div.absolute.bottom-0.right-0.top-0.inline-flex.items-center.juice\\:justify-center'
    )
    return largeViewDiv || smallViewDiv
}

function createTreeButton() {
    const innerButton = document.createElement('button')
    innerButton.className =
        'h-10 rounded-lg px-2 text-token-text-secondary focus-visible:outline-0 hover:bg-token-main-surface-secondary focus-visible:bg-token-main-surface-secondary'
    innerButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-xl-heavy"><path fill="currentColor" fill-rule="evenodd" d="M13 24h-2v-5.126c-.806-.208-1.513-.661-2.039-1.274-.602.257-1.265.4-1.961.4-2.76 0-5-2.24-5-5 0-1.422.595-2.707 1.55-3.617-.348-.544-.55-1.19-.55-1.883 0-1.878 1.483-3.413 3.341-3.496.823-2.332 3.047-4.004 5.659-4.004 2.612 0 4.836 1.672 5.659 4.004 1.858.083 3.341 1.618 3.341 3.496 0 .693-.202 1.339-.55 1.883.955.91 1.55 2.195 1.55 3.617 0 2.76-2.24 5-5 5-.696 0-1.359-.143-1.961-.4-.526.613-1.233 1.066-2.039 1.274v5.126z" clip-rule="evenodd"/></svg>'

    const treeButton = document.createElement('span')
    treeButton.setAttribute('data-state', 'closed')
    treeButton.id = 'chatgpt-tree-view-enter-button'
    treeButton.appendChild(innerButton)
    treeButton.onclick = () => {
        chrome.runtime.sendMessage({ action: 'request-tree' })
    }

    return treeButton
}

function checkIfTreeButtonExists() {
    const topRight2ButtonsFlexboxDiv = getTopRight2ButtonsFlexboxDiv()
    if (!topRight2ButtonsFlexboxDiv) {
        return false
    }

    let treeButton = document.getElementById('chatgpt-tree-view-enter-button')
    if (treeButton) {
        return true
    }
    return false
}

function addTreeButton() {
    if (checkIfTreeButtonExists()) {
        return false
    }

    let topRight2ButtonsFlexboxDiv = getTopRight2ButtonsFlexboxDiv()

    function tryAdd() {
        topRight2ButtonsFlexboxDiv = getTopRight2ButtonsFlexboxDiv()
        if (!topRight2ButtonsFlexboxDiv) {
            requestAnimationFrame(tryAdd)
            return
        } else {
            if (!checkIfTreeButtonExists()) {
                const treeButton = createTreeButton()
                topRight2ButtonsFlexboxDiv.insertBefore(
                    treeButton,
                    topRight2ButtonsFlexboxDiv.firstChild
                )
            }
        }
    }

    tryAdd()
    return true
}

export { addTreeButton }
