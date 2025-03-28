"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Bold, Italic, List, Link as LinkIcon } from "lucide-react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/format-date"

interface Update {
    id: string
    content: string
    date: string
}

interface UpdatesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    updates: Update[]
    onAddUpdate: (content: string) => void
    onDeleteUpdate: (id: string) => void
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="border-b p-2 flex gap-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-accent' : ''}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-accent' : ''}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-accent' : ''}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    const url = window.prompt('Enter URL')
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run()
                    }
                }}
                className={editor.isActive('link') ? 'bg-accent' : ''}
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
        </div>
    )
}

export function UpdatesDialog({
    open,
    onOpenChange,
    updates: initialUpdates,
    onAddUpdate,
    onDeleteUpdate
}: UpdatesDialogProps) {
    // Add local state for updates
    const [updates, setUpdates] = useState<Update[]>(initialUpdates)

    // Sync with parent updates
    useEffect(() => {
        setUpdates(initialUpdates)
    }, [initialUpdates])

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:underline',
                },
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] px-3 py-2',
            },
        },
    })

    const handleSubmit = () => {
        if (editor?.isEmpty) return

        const content = editor?.getHTML() || ""
        if (content.trim()) {
            // Create new update
            const newUpdate: Update = {
                id: Date.now().toString(),
                content: content,
                date: formatDate(new Date().toISOString())
            }

            // Update local state immediately
            setUpdates(prev => [newUpdate, ...prev])

            // Notify parent
            onAddUpdate(content)

            // Clear editor
            editor?.commands.setContent('')
        }
    }

    const handleDelete = (id: string) => {
        // Update local state immediately
        setUpdates(prev => prev.filter(update => update.id !== id))

        // Notify parent
        onDeleteUpdate(id)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Updates</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* New Update Form - Moved to top */}
                    <div className="space-y-2 flex flex-col items-center gap-2 rounded-md">
                        {/* <MenuBar editor={editor} /> */}
                        <EditorContent editor={editor} className="w-full border rounded-lg bg-background" />
                        <div className="p-2 w-full flex justify-start">
                            <Button
                                onClick={handleSubmit}
                                size="sm"
                                className="w-fit bg-blue-600 rounded-[0.35rem] hover:bg-blue-700 text-white"
                                disabled={editor?.isEmpty}
                            >
                                Post Update
                            </Button>
                        </div>
                    </div>

                    {/* Updates List with ScrollArea */}
                    <ScrollArea className="h-[300px] rounded-md">
                        <div className="space-y-3 p-4">
                            {updates.map((update) => (
                                <div
                                    key={update.id}
                                    className="p-4 rounded-[0.35rem]  border group bg-background"
                                >
                                    <div className="flex items-start justify-between ">

                                        <div className="flex flex-col gap-2">
                                            <div
                                                className="text-sm prose prose-sm dark:prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{ __html: update.content }}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(update.date)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(update.id)}
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
} 