import React, { useRef, useEffect, useState, useCallback } from 'react'
import { MilkdownProvider } from '@milkdown/react'

import { MilkdownEditor } from './editor'
import { useTreeContext } from './tree-provider'
import { useCanvasContext } from './canvas-provider'
import {
    UserLogo,
    AssistantLogo,
    EditIcon,
    CopyIcon,
    TrashIcon,
    PlusIcon,
} from './svgs'

const SingularMessageDisplay = ({ message, isUser }) => {
    const chunks = message.chunks

    const textChunks = chunks.filter((chunk) => chunk.type === 'text')

    return (
        <div
            className="w-full mx-auto flex flex-1 gap-4 text-base bg-dark-textChunkBackground p-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] max-h-[50rem] overflow-auto hover:overflow-y-scroll rounded-md overscroll-contain"
            name="singular-message-display" // for canvas to find this
            onMouseDown={(e) => {e.stopPropagation()}}
        >
            <div className="w-full group/conversation-turn relative flex min-w-0 flex-col gap-1 md:gap-3 overscroll-contain cursor-text">
                {textChunks.map((textChunk, index) => {
                    return (
                        <MilkdownProvider key={index}>
                            <MilkdownEditor defaultValue={textChunk.value} />
                        </MilkdownProvider>
                    )
                })}
            </div>
        </div>
    )
}

const SmallButton = ({ children }) => {
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
            className="rounded-lg transition-all hover:bg-neutral-800 p-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={buttonRef}
        >
            {children}
        </div>
    )
}

const UserMessageMenu = () => {
    return (
        <div className="relative w-full">
            <div className="absolute left-1/2 transform -translate-x-1/2 my-auto">
                <UserLogo />
            </div>
            <div className="flex justify-end gap-1">
                <SmallButton>
                    <EditIcon />
                </SmallButton>
                <SmallButton>
                    <CopyIcon />
                </SmallButton>
                <SmallButton>
                    <TrashIcon />
                </SmallButton>
            </div>
        </div>
    )
}

const AssistantMessageMenu = () => {
    return (
        <div className="relative w-full">
            <div className="absolute left-1/2 transform -translate-x-1/2 my-auto">
                <AssistantLogo />
            </div>
            <div className="flex justify-end gap-1">
                <SmallButton>
                    <CopyIcon />
                </SmallButton>
                <SmallButton>
                    <TrashIcon />
                </SmallButton>
            </div>
        </div>
    )
}

const MergedMessageBlock = ({ message }) => {
    const id = message.id
    const userMessage = message.userMessage
    const assistantBranches = message.assistantBranches

    const containerRef = useRef(null)
    const blockRef = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [dimension, setDimension] = useState({ width: 0, height: 0 })
    const dragStartPosRef = useRef(null)

    const {
        positions,
        setPositions,
        dimensions,
        setDimensions,
        setHighestZIndex,
        zIndices,
        setZIndices,
    } = useTreeContext()

    const { scale } = useCanvasContext()

    const [hovered, setHovered] = useState(false)

    const handleMouseEnter = () => {
        setHovered(true)
    }

    const handleMouseLeave = () => {
        setHovered(false)
    }

    useEffect(() => {
        const block = blockRef.current
        if (block) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    // should really only be one entry but this is more robust
                    const { offsetWidth, offsetHeight } = entry.target
                    const newDimension = {
                        width: offsetWidth,
                        height: offsetHeight,
                    }
                    setDimension(newDimension)
                    setDimensions((prev) => ({ ...prev, [id]: newDimension }))
                }
            })
            resizeObserver.observe(block)
            return () => {
                resizeObserver.unobserve(block)
            }
        }
    }, [message, id, blockRef, setDimensions])

    useEffect(() => {
        setPosition(positions[id] || { x: 0, y: 0 })
    }, [positions, id])

    useEffect(() => {
        const offsetPos = {
            x: position.x,
            y: position.y - dimension.height / 2,
        }
        containerRef.current.style.transform = `translate(${offsetPos.x}px, ${offsetPos.y}px)`
    }, [position])

    const handleDragMove = useCallback(
        (event) => {
            if (!dragStartPosRef) {
                return
            }
            const { x: dragStartX, y: dragStartY } = dragStartPosRef.current

            blockRef.current.style.cursor = 'grabbing'
            const deltaX = event.clientX - dragStartX
            const deltaY = event.clientY - dragStartY
            const newPosition = {
                x: position.x + deltaX / scale,
                y: position.y + deltaY / scale,
            }
            setPosition(newPosition)
            setPositions((prev) => ({ ...prev, [id]: newPosition }))
        },
        [id, position, scale, setPosition, setPositions]
    )

    const handleDragEnd = useCallback(() => {
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
        blockRef.current.style.cursor = 'grab'
    }, [handleDragMove])

    const handleDragStart = useCallback(
        (event) => {
            blockRef.current.style.cursor = 'grabbing'

            event.stopPropagation()
            event.preventDefault()
            setHighestZIndex((prevZIndex) => {
                const newZIndex = prevZIndex + 1
                setZIndices({ ...zIndices, [id]: newZIndex })
                return newZIndex
            })
            dragStartPosRef.current = { x: event.clientX, y: event.clientY }

            document.addEventListener('mousemove', handleDragMove)
            document.addEventListener('mouseup', handleDragEnd)
        },
        [setZIndices, zIndices, setHighestZIndex, handleDragMove, handleDragEnd]
    )

    return (
        <div
            className="absolute"
            style={{
                zIndex: zIndices[id],
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            id={`tree-view-message-${id}`}
            ref={containerRef}
        >
            <div
                className="flex flex-col gap-3 text-base py-[18px] px-4 border-2 bg-dark-blockBackground rounded-[36px] border-gray-200 shadow-xl shadow-dark-shadow cursor-grab"
                style={{
                    width: '40rem',
                }}
                onMouseDown={handleDragStart}
                ref={blockRef}
            >
                <UserMessageMenu />
                <SingularMessageDisplay message={userMessage} isUser />

                <AssistantMessageMenu />
                <SingularMessageDisplay message={assistantBranches[0]} />
            </div>
            <div
                className="w-12 absolute rounded-lg transition-all hover:bg-neutral-800 hover:opacity-80 p-1"
                style={{
                    transform: `translate(${dimension.width}px, -${dimension.height}px)`,
                    height: `${dimension.height}px`,
                }}
            >
                <div className='mx-auto my-3 flex justify-center items-center'>
                    <PlusIcon />
                </div>
            </div>
        </div>
    )
}

export { MergedMessageBlock }
