import React, { useRef, useEffect, useState } from 'react'

const PAN_INTENSITY = 2
const ZOOM_INTENSITY = 0.06
const MIN_SCALE = 0.1
const MAX_SCALE = 4

// not actually a canvas element
const Canvas = ({ children }) => {
    const canvasRef = useRef(null)
    const parentRef = useRef(null)

    const [isPanning, setIsPanning] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startY, setStartY] = useState(0)
    const [translateX, setTranslateX] = useState(0)
    const [translateY, setTranslateY] = useState(0)
    const [scale, setScale] = useState(1)
    const [initialDistance, setInitialDistance] = useState(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const parent = parentRef.current
        parent.style.transformOrigin = '0 0' // Set the transform origin to the top left corner so the maths work out

        let wheelEndTimeout = null

        const getMousePosition = (event) => {
            const parentRect = canvasRef.current.getBoundingClientRect()
            return {
                mouseX: event.clientX - parentRect.left,
                mouseY: event.clientY - parentRect.top,
            }
        }

        const getDistance = (touch1, touch2) => {
            const dx = touch2.clientX - touch1.clientX
            const dy = touch2.clientY - touch1.clientY
            return Math.sqrt(dx * dx + dy * dy)
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

            console.log("zoomAtXY", newTranslateX, newTranslateY)
            setTranslateX(newTranslateX)
            setTranslateY(newTranslateY)
            setScale(s)
            parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
        }

        const handleMouseDown = (event) => {
            // for mouse users
            if (event.button === 1) {
                // Middle mouse button
                setIsPanning(true)
                setStartX(event.clientX - translateX)
                setStartY(event.clientY - translateY)
            }
        }

        const handleMouseUp = () => {
            // for mouse users
            setIsPanning(false)
        }

        const handleMouseMove = (event) => {
            // for mouse users
            if (!isPanning) return
            if (event.button !== 1) return

            setTranslateX(event.clientX - startX)
            setTranslateY(event.clientY - startY)
            parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
        }

        const handleWheel = (event) => {
            // console.log(event)
            if (!canvas.contains(event.target)) {
                return
            }

            if (event.ctrlKey || event.metaKey) {
                // Zooming
                event.preventDefault()
                const scrollDirection = event.deltaY > 0 ? -1 : 1

                // Calculate the new scale
                const newScale =
                    scale + scale * scrollDirection * ZOOM_INTENSITY

                const { mouseX, mouseY } = getMousePosition(event)
                zoomAtXY(newScale, mouseX, mouseY)
            } else {
                // Panning

                // Determine what the user is scrolling over
                const findScrollableParent = (element) => {
                    let parent = element
                    while (parent && parent !== document.body) {
                        const overflowY = window.getComputedStyle(parent).overflowY
                        const isScrollable =
                            (overflowY === 'auto' || overflowY === 'scroll') &&
                            parent.scrollHeight > parent.clientHeight
    
                        if (isScrollable) {
                            return parent
                        }
                        parent = parent.parentElement
                    }
                    return null
                }

                // Find the nearest scrollable ancestor
                const scrollableParent = findScrollableParent(event.target)
                // console.log(scrollableParent)

                // Prevent default behavior only if no scrollable parent is found
                if (
                    scrollableParent &&
                    scrollableParent.getAttribute('name') ==
                        'singular-message-display' &&
                    event.wheelDeltaY !== 0 &&
                    isPanning === false
                ) {
                    setIsPanning(false)
                    return
                } else {
                    event.preventDefault()
                }

                setIsPanning(true)
                clearInterval(wheelEndTimeout)
                wheelEndTimeout = setTimeout(() => {
                    setIsPanning(false)
                }, 500)

                setTranslateX(translateX - event.deltaX * PAN_INTENSITY)
                setTranslateY(translateY - event.deltaY * PAN_INTENSITY)
                parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
            }
        }

        const handleMouseLeave = () => {
            setIsPanning(false)
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
                {children}
            </div>
        </div>
    )
}

export { Canvas }
