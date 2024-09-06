import React, { useEffect } from 'react'
import {
    Editor,
    rootCtx,
    defaultValueCtx,
    editorViewCtx,
} from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { nord } from '@milkdown/theme-nord'
import { Milkdown, useEditor } from '@milkdown/react'

interface MilkdownEditorProps {
    defaultValue: string
    editing: boolean
}

const MilkdownEditor: React.FC<MilkdownEditorProps> = ({ defaultValue, editing }) => {
    const { get } = useEditor((root) =>
        Editor.make()
            .config(nord)
            .config((ctx) => {
                ctx.set(rootCtx, root)
                ctx.set(defaultValueCtx, defaultValue)
            })
            .use(commonmark)
    )

    const editor = get()
    useEffect(() => {
        if (editing && editor) {
            editor.action((ctx) => {
                ctx.get(editorViewCtx).focus()
            })
        }
    }, [editor, editing])

    return <Milkdown />
}

export default MilkdownEditor
