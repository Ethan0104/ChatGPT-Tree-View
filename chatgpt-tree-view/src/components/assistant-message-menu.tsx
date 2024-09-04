import React from 'react'

import { AssistantLogo, CopyIcon, TrashIcon } from './svgs'
import SmallButton from './small-button'

const AssistantMessageMenu: React.FC = () => {
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

export default AssistantMessageMenu