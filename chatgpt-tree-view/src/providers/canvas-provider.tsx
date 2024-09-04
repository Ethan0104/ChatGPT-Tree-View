import React, { createContext, useContext, useState } from 'react'

interface CanvasContextValue {
    isPanning: boolean
    setIsPanning: React.Dispatch<React.SetStateAction<boolean>>
    startX: number
    setStartX: React.Dispatch<React.SetStateAction<number>>
    startY: number
    setStartY: React.Dispatch<React.SetStateAction<number>>
    translateX: number
    setTranslateX: React.Dispatch<React.SetStateAction<number>>
    translateY: number
    setTranslateY: React.Dispatch<React.SetStateAction<number>>
    scale: number
    setScale: React.Dispatch<React.SetStateAction<number>>
    initialDistance: number
    setInitialDistance: React.Dispatch<React.SetStateAction<number>>
}

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined)

interface CanvasProviderProps {
    children: React.ReactNode
}

const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
    const [isPanning, setIsPanning] = useState<boolean>(false)
    const [startX, setStartX] = useState<number>(0)
    const [startY, setStartY] = useState<number>(0)
    const [translateX, setTranslateX] = useState<number>(0)
    const [translateY, setTranslateY] = useState<number>(0)
    const [scale, setScale] = useState<number>(1)
    const [initialDistance, setInitialDistance] = useState<number>(0)

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

const useCanvasContext = () => {
    const context = useContext(CanvasContext)
    if (context === undefined) {
        throw new Error('useCanvasContext must be used within a CanvasProvider')
    }
    return context
}

export { CanvasProvider, useCanvasContext }
