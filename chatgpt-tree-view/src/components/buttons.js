import React, { useEffect, useState, useRef } from 'react'

const PillButton = ({ onClick, text, isPrimary }) => {
    const [hovered, setHovered] = useState(false)
    const buttonRef = useRef(null)

    const handleMouseEnter = () => {
        setHovered(true)
    }

    const handleMouseLeave = () => {
        setHovered(false)
    }

    useEffect(() => {
        buttonRef.current.style.cursor = hovered ? 'pointer' : 'default'
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
