import React, { useEffect } from 'react'
import {
    Editor,
    rootCtx,
    defaultValueCtx,
    editorViewCtx,
} from '@milkdown/kit/core'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { nord } from '@milkdown/theme-nord'
import { Milkdown, useEditor } from '@milkdown/react'
import logger from '../logger'

interface MilkdownEditorProps {
    defaultValue: string
    editing: boolean
    reportOutput: (output: string) => void
}

const MilkdownEditor: React.FC<MilkdownEditorProps> = ({ defaultValue, editing, reportOutput }) => {
    const [output, setOutput] = React.useState<string>('')
    
    const { get } = useEditor((root) =>
        Editor.make()
            .config(nord)
            .config((ctx) => {
                ctx.set(rootCtx, root)
                ctx.set(defaultValueCtx, defaultValue)

                // warning: this creates performance overhead for large documents (Milkdown docs)
                ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
                    setOutput(markdown)
                })
            })
            .use(commonmark)
            .use(listener)
    )

    const editor = get()
    useEffect(() => {
        if (editing && editor) {
            editor.action((ctx) => {
                ctx.get(editorViewCtx).focus()
            })
        }
    }, [editor, editing])

    useEffect(() => {
        reportOutput(output)
    }, [output])

    return <Milkdown />
}

export default MilkdownEditor
