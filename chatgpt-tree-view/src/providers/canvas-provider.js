import React, { createContext, useContext, useState } from 'react'

const CanvasContext = createContext()

const CanvasProvider = ({ children }) => {
    const [isPanning, setIsPanning] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startY, setStartY] = useState(0)
    const [translateX, setTranslateX] = useState(0)
    const [translateY, setTranslateY] = useState(0)
    const [scale, setScale] = useState(1)
    const [initialDistance, setInitialDistance] = useState(null)

    return (
        <CanvasContext.Provider
            value={{
                isPanning,
                setIsPanning,
                startX,
                setStartX,
                startY,
                setStartY,
                translateX,
                setTranslateX,
                translateY,
                setTranslateY,
                scale,
                setScale,
                initialDistance,
                setInitialDistance,
            }}
        >
            {children}
        </CanvasContext.Provider>
    )
}

const useCanvasContext = () => useContext(CanvasContext)

export { CanvasProvider, useCanvasContext }
