import React from 'react'

import { UserLogo, CopyIcon } from './svgs'
import SmallButton from './small-button'

const UserMessageMenu: React.FC = () => {
    return (
        <div className="relative w-full">
            <div className="absolute left-1/2 transform -translate-x-1/2 my-auto">
                <UserLogo />
            </div>
            <div className="flex justify-end gap-1">
                <SmallButton>
                    <CopyIcon />
                </SmallButton>
            </div>
        </div>
    )
}

export default UserMessageMenu