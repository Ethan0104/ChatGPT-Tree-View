import React, { useRef, useEffect, useState } from 'react'

import { queryProfilePicElement } from './profile-pic'
import { GPT4oAvatar } from './avatars'
import { useTreeContext } from './tree-provider'

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
            <div className="group/conversation-turn relative flex min-w-0 flex-col flex-col gap-1 md:gap-3">
                {textChunks.map((textChunk, index) => (
                    <div key={index}>{textChunk.value}</div>
                ))}
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
            <div className="group/conversation-turn relative flex min-w-0 flex-col flex-col gap-1 md:gap-3">
                {textChunks.map((textChunk, index) => (
                    <div key={index}>{textChunk.value}</div>
                ))}
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
        const { offsetWidth, offsetHeight } = ref.current
        const newDimension = { width: offsetWidth, height: offsetHeight }
        setDimension(newDimension)
        setDimensions((prev) => ({ ...prev, [id]: newDimension }))
    }, [message, id, setDimensions])

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
            className="text-base py-[18px] px-3 md:px-4 md:px-5 lg:px-1 xl:px-5 border-2 rounded-md border-gray-400 absolute"
            style={{ width: '40rem' }}
            id={`tree-view-message-${id}`}
            ref={ref}
        >
            <UserMessageDisplay userMessage={userMessage} />
            <hr className="my-3"></hr>
            <AssistantMessageDisplay assistantMessage={assistantBranches[0]} />
        </div>
    )
}

export { MergedMessageBlock }
