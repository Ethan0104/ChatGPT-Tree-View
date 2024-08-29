import React, { useEffect, useState, useRef } from 'react'

const PrimaryButton = ({ text, onClick }) => {
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

    return (
        <div
            className="bg-dark-primary rounded-full transition-all hover:opacity-80 p-2 text-xl"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={buttonRef}
            onClick={onClick}
        >
            {text}
        </div>
    )
}

export { PrimaryButton }
