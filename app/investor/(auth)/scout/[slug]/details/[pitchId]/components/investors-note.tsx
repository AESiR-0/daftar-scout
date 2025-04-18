"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface InvestorsNoteProps {
  note: string
}

export function InvestorsNote({ note }: InvestorsNoteProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: note,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-3 py-2',
      },
    },
  })

  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardContent>
        <div className="border h-[450px] rounded-xl">
          <EditorContent editor={editor} className="w-full h-full bg-[#1a1a1a] rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
} 