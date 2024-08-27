import React, { useRef, useEffect, useState } from 'react'
import { MilkdownProvider } from '@milkdown/react'

import { MilkdownEditor } from './editor'
import { queryProfilePicElement } from './profile-pic'
import { GPT4oAvatar } from './avatars'
import { useTreeContext } from './tree-provider'
import {
    UserLogo,
    AssistantLogo,
    EditIcon,
    CopyIcon,
    TrashIcon,
} from './svgs'

const UserMessageDisplay = ({ userMessage }) => {
    const chunks = userMessage.chunks

    const textChunks = chunks.filter((chunk) => chunk.type === 'text')

    return (
        <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
            <div className="flex-shrink-0 flex flex-col relative items-end">
                <div
                    dangerouslySetInnerHTML={{
                        __html: queryProfilePicElement().outerHTML,
                    }}
                ></div>
            </div>
            <div className="group/conversation-turn relative flex min-w-0 flex-col gap-1 md:gap-3">
                {/* {textChunks.map((textChunk, index) => {
                    const html = renderMarkdown(textChunk.value)
                    return (
                        <div
                            key={index}
                            dangerouslySetInnerHTML={{ __html: html }}
                        ></div>
                    )
                })} */}
                {textChunks.map((textChunk, index) => {
                    return (
                        <div key={index} className="text-base">
                            {textChunk.value}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const AssistantMessageDisplay = ({ assistantMessage }) => {
    const chunks = assistantMessage.chunks

    const textChunks = chunks.filter((chunk) => chunk.type === 'text')

    return (
        <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
            <div className="flex-shrink-0 flex flex-col relative items-end">
                <GPT4oAvatar />
            </div>
            <div className="group/conversation-turn relative flex min-w-0 flex-col gap-1 md:gap-3">
                {/* {textChunks.map((textChunk, index) => {
                    const html = renderMarkdown(textChunk.value)
                    return (
                        <div
                            key={index}
                            dangerouslySetInnerHTML={{ __html: html }}
                        ></div>
                    )
                })} */}
                {textChunks.map((textChunk, index) => {
                    return (
                        <div key={index} className="text-base">
                            {textChunk.value}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const SingularMessageDisplay = ({ message, isUser }) => {
    const chunks = message.chunks

    const textChunks = chunks.filter((chunk) => chunk.type === 'text')

    return (
        <div className="w-full mx-auto flex flex-1 gap-4 text-base bg-dark-textChunkBackground p-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] rounded-md">
            <div className="group/conversation-turn relative flex min-w-0 flex-col gap-1 md:gap-3">
                {textChunks.map((textChunk, index) => {
                    return (
                        <MilkdownProvider>
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

    const handleMouseEnter = () => {
        setHovered(true)
    }

    const handleMouseLeave = () => {
        setHovered(false)
    }

    return (
        <div
            className="rounded-lg transition-all hover:bg-neutral-800 p-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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

    const ref = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [dimension, setDimension] = useState({ width: 0, height: 0 })

    const { positions, setPositions, dimensions, setDimensions } =
        useTreeContext()

    useEffect(() => {
        const container = ref.current
        if (container) {
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
            resizeObserver.observe(container)
            return () => {
                resizeObserver.unobserve(container)
            }
        }
    }, [message, id, ref, setDimensions])

    useEffect(() => {
        setPosition(positions[id] || { x: 0, y: 0 })
    }, [positions, id])

    useEffect(() => {
        const offsetPos = {
            x: position.x,
            y: position.y - dimension.height / 2,
        }
        ref.current.style.transform = `translate(${offsetPos.x}px, ${offsetPos.y}px)`
    }, [position])

    return (
        <div
            className="flex flex-col gap-3 text-base py-[18px] px-3 md:px-4 lg:px-1 xl:px-5 border-2 bg-dark-blockBackground rounded-3xl border-gray-200 absolute shadow-xl shadow-dark-shadow"
            style={{
                width: '40rem',
            }}
            id={`tree-view-message-${id}`}
            ref={ref}
        >
            <UserMessageMenu />
            <SingularMessageDisplay message={userMessage} isUser />

            <AssistantMessageMenu />
            <SingularMessageDisplay message={assistantBranches[0]} />
        </div>
    )
}

export { MergedMessageBlock }
