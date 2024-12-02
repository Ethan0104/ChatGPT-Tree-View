import React from 'react'

import SquareButton from './square-button'
import { TreeViewEnterIcon } from './svgs'

const TreeButton: React.FC = () => (
    <SquareButton
        onClick={() => {
            window.dispatchEvent(new Event('show-app'))
        }}
    >
        <div id="chatgpt-tree-view-enter-button">
            <TreeViewEnterIcon />
        </div>
    </SquareButton>
)

export default TreeButton
