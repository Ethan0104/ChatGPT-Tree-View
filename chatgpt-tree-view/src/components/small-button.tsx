import React, { useEffect, useRef, useState } from 'react'

interface SmallButtonProps {
    children: React.ReactNode
}

const SmallButton: React.FC<SmallButtonProps> = ({ children }) => {
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

    return (
        <div
            className="rounded-lg tree-transition-all hover:tree-bg-neutral-800 p-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={buttonRef}
        >
            {children}
        </div>
    )
}

export default SmallButton