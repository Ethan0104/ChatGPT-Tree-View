import React, { useEffect, useState, useRef } from 'react'

interface PillButtonProps {
    onClick?: () => void
    text: string
    isPrimary?: boolean
}

const PillButton: React.FC<PillButtonProps> = ({ onClick, text, isPrimary }) => {
    const [hovered, setHovered] = useState<boolean>(false)
    const buttonRef = useRef<HTMLDivElement>(null)

    const handleMouseEnter = () => {
        setHovered(true)
    }

    const handleMouseLeave = () => {
        setHovered(false)
    }

    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.style.cursor = hovered ? 'pointer' : 'default'
        }
    }, [hovered])

    const btnClass = isPrimary ? 'btn-primary' : 'btn-secondary'

    return (
        <div
            className={`btn ${btnClass}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={buttonRef}
            onClick={onClick}
        >
            {text}
        </div>
    )
}

export { PillButton }
