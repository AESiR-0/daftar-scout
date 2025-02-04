"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollText, Bold, Italic, List } from "lucide-react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface JournalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JournalDialog({ open, onOpenChange }: JournalDialogProps) {
  const [note, setNote] = useState("")

  const editor = useEditor({
    extensions: [StarterKit],
    content: note,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setNote(html)
    },
  })

  // Load saved note when dialog opens
  useEffect(() => {
    if (open && editor) {
      const savedNote = localStorage.getItem("journal")
      if (savedNote) {
        setNote(savedNote)
        editor.commands.setContent(savedNote)
      }
    }
  }, [open, editor])

  // Auto-save whenever note changes
  useEffect(() => {
    const saveNote = () => {
      localStorage.setItem("journal", note)
      console.log("Auto-saving note...")
    }

    const debounceTimer = setTimeout(saveNote, 500) // Debounce save for 500ms
    return () => clearTimeout(debounceTimer)
  }, [note])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex flex-col h-[28rem]">
          <div className="flex items-center gap-2 p-4 border-b">
            <ScrollText className="h-4 w-4" />
            <h2 className="text-sm font-medium">Journal</h2>
          </div>

          <div className="flex items-center gap-2 p-2 border-b">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor?.isActive('bold') ? 'bg-gray-100' : ''
              }`}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor?.isActive('italic') ? 'bg-gray-100' : ''
              }`}
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor?.isActive('bulletList') ? 'bg-gray-100' : ''
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 p-4">
            <EditorContent 
              editor={editor} 
              className="h-full prose max-w-none"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 