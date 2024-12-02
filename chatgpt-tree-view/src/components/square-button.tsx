import React from 'react'

interface SquareButtonProps {
    onClick: () => void
    children: React.ReactNode
}

const SquareButton: React.FC<SquareButtonProps> = ({ onClick, children }) => (
    <button
        className="h-10 rounded-lg px-2 text-token-text-secondary focus-visible:outline-0 hover:tree-bg-dark-buttonHover"
        onClick={onClick}
    >
        {children}
    </button>
)

export default SquareButton
