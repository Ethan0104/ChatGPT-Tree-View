import React, { useState, useEffect, useRef, useCallback } from 'react'

import Message from '../models/message'
import Vector from '../models/vector'
import { useTreeContext } from '../providers/tree-provider'
import { useLayoutContext } from '../providers/layout-provider'
import { useCanvasContext } from '../providers/canvas-provider'
import TextMessage from './text-message'
import UserMessageMenu from './user-message-menu'
import AssistantMessageMenu from './assistant-message-menu'
import { PillButton } from './buttons'
import { PlusIcon } from './svgs'
import Author from '../models/author'
import logger from '../logger'
import sendNewMessage from '../manipulators/message-sender'

interface MessageBlockProps {
    message: Message
}

const MessageBlock: React.FC<MessageBlockProps> = ({ message }) => {
    const id = message.id
    const isUser = message.author === Author.USER
    const isUnsentMessage = id.includes('-unsent')
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
    const [editing, setEditing] = useState<boolean>(isUnsentMessage)

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
    const { convoTree } = useTreeContext()
    const { scale } = useCanvasContext()

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

    const handleAddNewPrompt = () => {
        const newMsg = {
            id: `${crypto.randomUUID()}-unsent`,
            parent: message,
            children: [],
            author: Author.USER,
            modelSlug: null,
            content: {
                chunks: [],
            },
            attachments: [],
        }
        message.children.push(newMsg)
        convoTree.mapping[newMsg.id] = newMsg
        addNewBlock(id, newMsg.id)
    }

    const handleSend = () => {
        sendNewMessage(message.content.chunks[0].parts[0] as string)
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
                className="flex flex-col gap-3 text-base py-[18px] px-4 border-2 tree-bg-dark-blockBackground tree-rounded-[36px] tree-border-gray-200 shadow-xl tree-shadow-dark-shadow cursor-grab"
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
                <TextMessage text={text} isUser={isUser} editing={editing} reportContent={updateMessageContent} />

                {editing && (
                    <div className="flex justify-end gap-2">
                        <PillButton text="Cancel" />
                        <PillButton text="Send" onClick={handleSend} isPrimary />
                    </div>
                )}

                {!isUser && (
                    <div className="flex justify-end">
                        <PillButton text="Add Prompt" onClick={handleAddNewPrompt} isPrimary />
                    </div>
                )}
            </div>
            {/* <div
                className="w-12 absolute rounded-lg hover:bg-neutral-800 hover:opacity-80 p-1"
                style={{
                    transform: `translate(${dimension.x}px, -${dimension.y}px)`,
                    height: `${dimension.y}px`,
                }}
            >
                <div className="mx-auto my-3 flex justify-center items-center">
                    <PlusIcon />
                </div>
            </div> */}
        </div>
    )
}

export default MessageBlock