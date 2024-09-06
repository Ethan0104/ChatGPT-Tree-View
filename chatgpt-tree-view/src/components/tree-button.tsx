import React from 'react'

const TreeButton: React.FC = () => (
    <span data-state="closed" id="chatgpt-tree-view-enter-button">
        <button
            className="h-10 rounded-lg px-2 text-token-text-secondary focus-visible:outline-0 hover:bg-token-main-surface-secondary focus-visible:bg-token-main-surface-secondary"
            onClick={() => {
                chrome.runtime.sendMessage({ action: 'request-tree' })
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                className="icon-xl-heavy"
            >
                <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M13 24h-2v-5.126c-.806-.208-1.513-.661-2.039-1.274-.602.257-1.265.4-1.961.4-2.76 0-5-2.24-5-5 0-1.422.595-2.707 1.55-3.617-.348-.544-.55-1.19-.55-1.883 0-1.878 1.483-3.413 3.341-3.496.823-2.332 3.047-4.004 5.659-4.004 2.612 0 4.836 1.672 5.659 4.004 1.858.083 3.341 1.618 3.341 3.496 0 .693-.202 1.339-.55 1.883.955.91 1.55 2.195 1.55 3.617 0 2.76-2.24 5-5 5-.696 0-1.359-.143-1.961-.4-.526.613-1.233 1.066-2.039 1.274v5.126z"
                    clipRule="evenodd"
                />
            </svg>
        </button>
    </span>
)

export default TreeButton
