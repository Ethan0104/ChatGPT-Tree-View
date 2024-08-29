import React, { useEffect } from 'react'
import {
    Editor,
    rootCtx,
    defaultValueCtx,
    editorViewOptionsCtx,
} from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import {
    Milkdown,
    MilkdownProvider,
    useEditor,
    useInstance,
} from '@milkdown/react'
import { commonmark } from '@milkdown/preset-commonmark'

const MilkdownEditor = ({ defaultValue }) => {
    const { get } = useEditor((root) =>
        Editor.make()
            .config(nord)
            .config((ctx) => {
                ctx.set(rootCtx, root)
                ctx.set(defaultValueCtx, defaultValue)
            })
            .use(commonmark)
    )

    return <Milkdown />
}

export { MilkdownEditor }
