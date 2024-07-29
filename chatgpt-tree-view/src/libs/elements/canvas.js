import React, { useRef, useEffect, useState } from 'react'

const PAN_INTENSITY = 2
const ZOOM_INTENSITY = 0.06
const MIN_SCALE = 0.1
const MAX_SCALE = 4

// not actually a canvas element
const Canvas = ({ blocks }) => {
    const canvasRef = useRef(null)
    const parentRef = useRef(null)
    const [isPanning, setIsPanning] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startY, setStartY] = useState(0)
    const [translateX, setTranslateX] = useState(0)
    const [translateY, setTranslateY] = useState(0)
    const [scale, setScale] = useState(1)
    const [initialDistance, setInitialDistance] = useState(null)

    const getMousePosition = (event) => {
        const parentRect = canvasRef.current.getBoundingClientRect()
        return {
            mouseX: event.clientX - parentRect.left,
            mouseY: event.clientY - parentRect.top,
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        const parent = parentRef.current
        parent.style.transformOrigin = '0 0' // Set the transform origin to the top left corner

        const handleMouseDown = (event) => {
            if (event.button === 1) {
                // Middle mouse button
                setIsPanning(true)
                setStartX(event.clientX - translateX)
                setStartY(event.clientY - translateY)
                canvas.style.cursor = 'grabbing'
            }
        }

        const handleMouseUp = () => {
            setIsPanning(false)
            canvas.style.cursor = 'grab'
        }

        const handleMouseMove = (event) => {
            if (!isPanning) return
            setTranslateX(event.clientX - startX)
            setTranslateY(event.clientY - startY)
            parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
        }

        const zoomAtXY = (newScale, centerX, centerY) => {
            // Cap the scale
            const s = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE)

            // Get the position of the center (mouse or canvas center) relative to the parent div
            const x = centerX - translateX
            const y = centerY - translateY

            // Calculate the new translate values
            const newTranslateX = translateX + (1 - s / scale) * x
            const newTranslateY = translateY + (1 - s / scale) * y

            setTranslateX(newTranslateX)
            setTranslateY(newTranslateY)
            setScale(s)
            parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
        }

        const handleWheel = (event) => {
            if (!canvas.contains(event.target)) return
            event.preventDefault()

            if (event.ctrlKey || event.metaKey) {
                // Zooming
                const scrollDirection = event.deltaY > 0 ? -1 : 1

                // Calculate the new scale
                const newScale =
                    scale + scale * scrollDirection * ZOOM_INTENSITY

                const { mouseX, mouseY } = getMousePosition(event)
                zoomAtXY(newScale, mouseX, mouseY)
            } else {
                // Panning
                setTranslateX(translateX - event.deltaX * PAN_INTENSITY)
                setTranslateY(translateY - event.deltaY * PAN_INTENSITY)
                parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
            }
        }

        const handleMouseLeave = () => {
            setIsPanning(false)
            canvas.style.cursor = 'grab'
        }

        const handleGestureStart = (event) => {
            if (!canvas.contains(event.target)) return
            event.preventDefault()
        }

        const handleGestureChange = (event) => {
            // UNTESTED PORTION
            if (!canvas.contains(event.target)) return
            event.preventDefault()

            const newScale = scale * event.scale
            const x = canvas.clientWidth / 2 - translateX
            const y = canvas.clientHeight / 2 - translateY

            zoomAtXY(newScale, x, y)
        }

        const handleTouchStart = (event) => {
            if (event.touches.length === 1) {
                setIsPanning(true)
                const touch = event.touches[0]
                setStartX(touch.clientX - translateX)
                setStartY(touch.clientY - translateY)
                canvas.style.cursor = 'grabbing'
            } else if (event.touches.length === 2) {
                setIsPanning(false)
                setInitialDistance(
                    getDistance(event.touches[0], event.touches[1])
                )
            }
        }

        const handleTouchMove = (event) => {
            if (isPanning && event.touches.length === 1) {
                const touch = event.touches[0]
                setTranslateX(touch.clientX - startX)
                setTranslateY(touch.clientY - startY)
                parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
            } else if (event.touches.length === 2) {
                // UNTESTED PORTION
                event.preventDefault()
                const newDistance = getDistance(
                    event.touches[0],
                    event.touches[1]
                )
                const zoomFactor = newDistance / initialDistance
                const newScale = scale * zoomFactor
                const x = canvas.clientWidth / 2 - translateX
                const y = canvas.clientHeight / 2 - translateY
                zoomAtXY(newScale, x, y)
            }
        }

        const handleTouchEnd = () => {
            setIsPanning(false)
            canvas.style.cursor = 'grab'
        }

        const getDistance = (touch1, touch2) => {
            const dx = touch2.clientX - touch1.clientX
            const dy = touch2.clientY - touch1.clientY
            return Math.sqrt(dx * dx + dy * dy)
        }

        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mouseup', handleMouseUp)
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('wheel', handleWheel)
        canvas.addEventListener('mouseleave', handleMouseLeave)
        canvas.addEventListener('gesturestart', handleGestureStart)
        canvas.addEventListener('gesturechange', handleGestureChange)
        canvas.addEventListener('touchstart', handleTouchStart)
        canvas.addEventListener('touchmove', handleTouchMove)
        canvas.addEventListener('touchend', handleTouchEnd)
        canvas.addEventListener('contextmenu', (event) => {
            if (event.button === 1) {
                event.preventDefault()
            }
        })

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown)
            canvas.removeEventListener('mouseup', handleMouseUp)
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('wheel', handleWheel)
            canvas.removeEventListener('mouseleave', handleMouseLeave)
            canvas.removeEventListener('gesturestart', handleGestureStart)
            canvas.removeEventListener('gesturechange', handleGestureChange)
            canvas.removeEventListener('touchstart', handleTouchStart)
            canvas.removeEventListener('touchmove', handleTouchMove)
            canvas.removeEventListener('touchend', handleTouchEnd)
        }
    }, [
        isPanning,
        startX,
        startY,
        translateX,
        translateY,
        scale,
        initialDistance,
    ])

    return (
        <div className="canvas h-full" ref={canvasRef}>
            <div className="parent h-full" ref={parentRef}>
                {blocks}
            </div>
        </div>
    )
}

export { Canvas }
