import React from "react"

import { GPT4oAvatar } from "../elements/avatars"

function MessageBlock({ message }) {
    const id = message.id
    const isAssistant = message.author && message.author.role === "assistant"
    // temp
    const texts = message.content.parts.map((part) => part.text)

    return (
        <div 
            className="text-base py-[18px] px-3 md:px-4 md:px-5 lg:px-1 xl:px-5 max-w-[40rem] border-2 rounded-md border-gray-400"
            id={`tree-view-message-${id}`}
        >
            <div className='mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]'>
                {isAssistant && <div className='flex-shrink-0 flex flex-col relative items-end'>
                    <GPT4oAvatar />
                </div>}
                <div className="group/conversation-turn relative flex min-w-0 flex-col flex-col gap-1 md:gap-3">
                    {texts.map((text) => <div>{text}</div>)}
                </div>
            </div>
        </div>
    )
}

export {
    MessageBlock,
}