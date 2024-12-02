import React, { useRef, useEffect, useCallback } from 'react'

import { useCanvasContext } from '../providers/canvas-provider'
import logger from '../logger'

const PAN_INTENSITY = 2
const ZOOM_INTENSITY = 0.06
const MIN_SCALE = 0.1
const MAX_SCALE = 4

interface CanvasProps {
    children: React.ReactNode
}

// not actually a canvas element
const Canvas: React.FC<CanvasProps> = ({ children }) => {
    const canvasRef = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLDivElement>(null)

    const {
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
    } = useCanvasContext()

    let wheelEndTimeout: NodeJS.Timeout | null = null

    // Constant Helper Functions
    const getMousePosition = (event: MouseEvent) => {
        if (canvasRef.current === null) return { mouseX: 0, mouseY: 0 }
        const parentRect = canvasRef.current.getBoundingClientRect()
        return {
            mouseX: event.clientX - parentRect.left,
            mouseY: event.clientY - parentRect.top,
        }
    }

    const getDistance = (touch1: Touch, touch2: Touch) => {
        const dx = touch2.clientX - touch1.clientX
        const dy = touch2.clientY - touch1.clientY
        return Math.sqrt(dx * dx + dy * dy)
    }

    // Memoized functions using useCallback
    const applyTransform = useCallback(() => {
        const parent = parentRef.current
        if (parent) {
            parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
        }
    }, [translateX, translateY, scale])

    const zoomAtXY = useCallback(
        (newScale: number, centerX: number, centerY: number) => {
            const s = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE)
            const x = centerX - translateX
            const y = centerY - translateY

            const newTranslateX = translateX + (1 - s / scale) * x
            const newTranslateY = translateY + (1 - s / scale) * y

            setTranslateX(newTranslateX)
            setTranslateY(newTranslateY)
            setScale(s)
            applyTransform()
        },
        [
            translateX,
            translateY,
            scale,
            setTranslateX,
            setTranslateY,
            setScale,
            MIN_SCALE,
            MAX_SCALE,
            applyTransform,
        ]
    )

    const handleMouseDown = useCallback(
        (event: MouseEvent) => {
            // for mouse users
            if (event.button === 1) {
                // Middle mouse button
                setIsPanning(true)
                setStartX(event.clientX - translateX)
                setStartY(event.clientY - translateY)
            }
        },
        [setIsPanning, setStartX, setStartY, translateX, translateY]
    )

    const handleMouseUp = useCallback(() => {
        // for mouse users
        setIsPanning(false)
    }, [setIsPanning])

    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            // for mouse users
            if (!isPanning) return
            if (event.button !== 1) return

            setTranslateX(event.clientX - startX)
            setTranslateY(event.clientY - startY)
            applyTransform()
        },
        [
            isPanning,
            setTranslateX,
            setTranslateY,
            startX,
            startY,
            applyTransform,
        ]
    )

    const handleWheel = useCallback(
        (event: WheelEvent) => {
            const canvas = canvasRef.current
            if (!canvas?.contains(event.target as Node)) {
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
                const findScrollableParent = (element: Element) => {
                    let parent = element
                    while (parent && parent !== document.body) {
                        const overflowY =
                            window.getComputedStyle(parent).overflowY
                        const isScrollable =
                            (overflowY === 'auto' || overflowY === 'scroll') &&
                            parent.scrollHeight > parent.clientHeight

                        if (isScrollable) {
                            return parent
                        }
                        parent = parent.parentElement as Element
                    }
                    return null
                }

                // Find the nearest scrollable ancestor
                const scrollableParent = findScrollableParent(event.target as Element)

                // Prevent default behavior only if no scrollable parent is found
                if (
                    scrollableParent &&
                    scrollableParent.getAttribute('data-name') ==
                        'singular-message-display' &&
                    event.deltaY !== 0 &&
                    isPanning === false
                ) {
                    setIsPanning(false)
                    return
                } else {
                    event.preventDefault()
                }

                setIsPanning(true)
                if (wheelEndTimeout) clearInterval(wheelEndTimeout)
                wheelEndTimeout = setTimeout(() => {
                    setIsPanning(false)
                }, 500)

                setTranslateX(translateX - event.deltaX * PAN_INTENSITY)
                setTranslateY(translateY - event.deltaY * PAN_INTENSITY)
                applyTransform()
            }
        },
        [
            scale,
            zoomAtXY,
            isPanning,
            setIsPanning,
            setTranslateX,
            setTranslateY,
            translateX,
            translateY,
            applyTransform,
            PAN_INTENSITY,
        ]
    )

    const handleMouseLeave = useCallback(() => {
        setIsPanning(false)
    }, [setIsPanning])

    const handleGestureStart = useCallback((event: Event) => {
        const canvas = canvasRef.current
        if (!canvas?.contains(event.target as Node)) return
        event.preventDefault()
    }, [])

    const handleGestureChange = useCallback(
        (event: Event) => {
            // UNTESTED PORTION
            const canvas = canvasRef.current
            if (!canvas?.contains(event.target as Node)) return
            event.preventDefault()
            
            // @ts-expect-error
            const newScale = scale * event.scale
            const x = canvas.clientWidth / 2 - translateX
            const y = canvas.clientHeight / 2 - translateY

            zoomAtXY(newScale, x, y)
        },
        [scale, translateX, translateY, zoomAtXY]
    )

    const handleTouchStart = useCallback(
        (event: TouchEvent) => {
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
        },
        [
            setIsPanning,
            setStartX,
            setStartY,
            translateX,
            translateY,
            setInitialDistance,
        ]
    )

    const handleTouchMove = useCallback(
        (event: TouchEvent) => {
            const canvas = canvasRef.current
            if (isPanning && event.touches.length === 1) {
                const touch = event.touches[0]
                setTranslateX(touch.clientX - startX)
                setTranslateY(touch.clientY - startY)
                applyTransform()
            } else if (event.touches.length === 2 && canvas) {
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
        },
        [
            isPanning,
            setTranslateX,
            setTranslateY,
            startX,
            startY,
            translateX,
            translateY,
            scale,
            initialDistance,
            zoomAtXY,
            applyTransform,
        ]
    )

    const handleTouchEnd = useCallback(() => {
        setIsPanning(false)
    }, [setIsPanning])

    useEffect(() => {
        const canvas = canvasRef.current
        const parent = parentRef.current
        if (!canvas || !parent) return
        parent.style.transformOrigin = '0 0' // Set the transform origin to the top left corner so the maths work out

        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mouseup', handleMouseUp)
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('wheel', handleWheel, { capture: true, passive: false })
        canvas.addEventListener('mouseleave', handleMouseLeave)
        canvas.addEventListener('gesturestart', handleGestureStart)
        canvas.addEventListener('gesturechange', handleGestureChange)
        canvas.addEventListener('touchstart', handleTouchStart)
        canvas.addEventListener('touchmove', handleTouchMove)
        canvas.addEventListener('touchend', handleTouchEnd)

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
        handleMouseDown,
        handleMouseUp,
        handleMouseMove,
        handleWheel,
        handleMouseLeave,
        handleGestureStart,
        handleGestureChange,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    ])

    return (
        <div className="canvas w-full h-full tree-top-0 tree-left-0 absolute" ref={canvasRef}>
            <div className="parent w-full h-full" ref={parentRef}>
                {children}
            </div>
        </div>
    )
}

export default Canvas
