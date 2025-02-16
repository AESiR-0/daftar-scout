"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { MenuBar } from "./menu-bar"

interface InvestorsNoteProps {
  note: string
}

export function InvestorsNote({ note }: InvestorsNoteProps) {
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
    content: note,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-3 py-2',
      },
    },
  })

  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader>
        
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <EditorContent editor={editor} className="w-full" />
        </div>
      </CardContent>
    </Card>
  )
} 