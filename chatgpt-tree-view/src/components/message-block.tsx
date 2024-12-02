import React, { useState, useEffect, useRef, useCallback } from 'react'

import { useTreeContext } from '../providers/tree-provider'
import { useLayoutContext } from '../providers/layout-provider'
import { useCanvasContext } from '../providers/canvas-provider'
import TextMessage from './text-message'
import UserMessageMenu from './user-message-menu'
import AssistantMessageMenu from './assistant-message-menu'
import { PillButton } from './pill-button'
import { PlusIcon } from './svgs'
import Message from '../models/message'
import Author from '../models/author'
import Vector from '../models/vector'
import sendNewMessage from '../manipulators/message-sender'
import { isMessageInCurrentBranch } from '../tree/traversal'
import logger from '../logger'

interface MessageBlockProps {
    message: Message
}

const MessageBlock: React.FC<MessageBlockProps> = ({ message }) => {
    // BIG PROBLEM: MessageBlock always gets re-rendered whenever the user pans or zooms canvas
    logger.info(`MessageBlock ${message.id} re-rendered at time ${new Date().getTime()}`)

    const id = message.id
    const isUser = message.author === Author.USER
    const messageChunks = message.content.chunks
    const text = messageChunks.reduce((accumulatedText, chunk) => {  // TODO: Fix this
        chunk.parts.forEach((part) => {
            if (typeof part === 'string') {
                accumulatedText += part
            } else {
                accumulatedText += ''
            }
        })
        return accumulatedText
    }, '')

    const containerRef = useRef<HTMLDivElement>(null)
    const blockRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState<Vector>({ x: 0, y: 0 })
    const [dimension, setDimension] = useState<Vector>({ x: 0, y: 0 })
    const dragStartPosRef = useRef<Vector>({ x: 0, y: 0 })

    const {
        positions,
        setPositions,
        dimensions,
        setDimensions,
        setHighestZIndex,
        zIndices,
        setZIndices,
        addNewBlock,
    } = useLayoutContext()
    const { scale } = useCanvasContext()
    const { convoTree } = useTreeContext()
    const inCurrentBranch = isMessageInCurrentBranch(convoTree, message)
    const borderColorClass = inCurrentBranch ? 'tree-border-dark-primary' : 'tree-border-gray-200'
    const borderWeightClass = inCurrentBranch ? 'tree-border-4' : 'border-2'

    const [hovered, setHovered] = useState<boolean>(false)

    const handleMouseEnter = () => {
        setHovered(true)
    }

    const handleMouseLeave = () => {
        setHovered(false)
    }

    // update the dimension of the block when the content changes
    useEffect(() => {
        const block = blockRef.current
        if (block) {
            const resizeObserver = new ResizeObserver((entries) => {
                // should really only be one entry but a for loop is more robust
                for (let entry of entries) {
                    // @ts-expect-error
                    const { offsetWidth, offsetHeight } = entry.target
                    const newDimension = {
                        x: offsetWidth,
                        y: offsetHeight,
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
    }, [message, id, setDimensions])

    // update the position when the positions change
    useEffect(() => {
        setPosition(positions[id] || { x: 0, y: 0 })
    }, [positions, id])

    // move the block when the position changes
    useEffect(() => {
        // the block's transform origin is 0 0 but our positions refer to the center
        if (containerRef.current) {
            const topLeftPos = {
                x: position.x,
                y: position.y,
            }
            containerRef.current.style.transform = `translate(${topLeftPos.x}px, ${topLeftPos.y}px)`
        }    
    }, [position, dimension])

    const handleDragMove = useCallback(
        (event: MouseEvent) => {
            if (!dragStartPosRef.current || !blockRef.current) {
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
        if (blockRef.current) {
            blockRef.current.style.cursor = 'grab'
        }
    }, [handleDragMove])

    const handleDragStart = useCallback(
        (event: React.MouseEvent) => {
            if (blockRef.current && dragStartPosRef.current) {
                blockRef.current.style.cursor = 'grabbing'

                event.stopPropagation()
                event.preventDefault()
                setHighestZIndex((prevZIndex) => {
                    const newZIndex = prevZIndex + 1
                    setZIndices({ ...zIndices, [id]: newZIndex })
                    return newZIndex
                })
                dragStartPosRef.current.x = event.clientX
                dragStartPosRef.current.y = event.clientY

                document.addEventListener('mousemove', handleDragMove)
                document.addEventListener('mouseup', handleDragEnd)
            }
        },
        [setZIndices, zIndices, setHighestZIndex, handleDragMove, handleDragEnd]
    )

    const updateMessageContent = (newContent: string) => {
        const newChunks = [
            {
                id: id,
                parts: [newContent],
            },
        ]
        const newMessage = {
            ...message,
            content: {
                chunks: newChunks,
            },
        }
        convoTree.mapping[id] = newMessage
    }

    return (
        <div
            className="absolute"
            style={{
                zIndex: zIndices[id],
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleDragStart}
            id={`tree-view-message-${id}`}
            ref={containerRef}
        >
            <div
                className={`flex flex-col gap-3 text-base py-[18px] px-4 ${borderWeightClass} tree-bg-dark-blockBackground tree-rounded-[36px] shadow-xl ${borderColorClass} tree-shadow-dark-shadow cursor-grab`}
                style={{
                    width: '40rem',
                }}
                ref={blockRef}
            >
                {
                    isUser ? (
                        <UserMessageMenu />
                    ) : (
                        <AssistantMessageMenu />
                    )
                }
                <TextMessage text={text} isUser={isUser} editing={false} reportContent={updateMessageContent} />
            </div>
        </div>
    )
}

export default MessageBlock