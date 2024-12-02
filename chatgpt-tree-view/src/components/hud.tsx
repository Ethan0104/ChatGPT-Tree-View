import React from 'react'
import { ExitIcon } from './svgs'
import SquareButton from './square-button'
import { closeTreeView } from '../manipulators/view-switcher'

const HUD: React.FC = () => {
    const handleClose = () => {
        closeTreeView()
    }

    return (
        <div className='
            tree-inset-0 absolute tree-m-3 tree-w-[calc(100%-2*0.75rem)] tree-h-[calc(100%-2*0.75rem)]
            tree-pointer-events-none
        '>
            {/* header */}
            <div className='flex tree-justify-items-end tree-items-end tree-justify-end w-full tree-pointer-events-auto tree-box-border'>
                <SquareButton onClick={handleClose}>
                    <ExitIcon />
                </SquareButton>
            </div>
        </div>
    )
}

export default HUD