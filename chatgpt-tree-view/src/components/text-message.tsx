import React, { useRef } from 'react'
import { MilkdownProvider } from '@milkdown/react'

import MilkdownEditor from './editor'

interface TextMessageProps {
    text: string
    isUser: boolean
    editing: boolean
}

const TextMessage: React.FC<TextMessageProps> = ({ text, isUser, editing }) => {
    const editorRef = useRef<HTMLDivElement>(null)

    return (
        <div
            className="w-full mx-auto flex flex-1 gap-4 text-base bg-dark-textChunkBackground p-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] max-h-[50rem] overflow-auto hover:overflow-y-scroll rounded-md overscroll-contain"
            data-name="singular-message-display" // for canvas to find this
            onMouseDown={(e) => {
                e.stopPropagation()
            }} // separate text select and dragging
        >
            <div
                className="w-full group/conversation-turn relative flex min-w-0 flex-col gap-1 md:gap-3 overscroll-contain cursor-text"
                ref={editorRef}
            >
                <MilkdownProvider>
                    <MilkdownEditor defaultValue={text} editing={editing} />
                </MilkdownProvider>
            </div>
        </div>
    )
}

export default TextMessage