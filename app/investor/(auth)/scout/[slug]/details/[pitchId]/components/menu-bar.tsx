"use client"

import { Editor } from '@tiptap/react'
import { Bold, Italic, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MenuBarProps {
  editor: Editor | null
}

export function MenuBar({ editor }: MenuBarProps) {
  if (!editor) return null

  return (
    <div className="border-b border-[#2a2a2a] p-2 flex gap-1 mb-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive('bold') && "bg-blue-500/20 text-blue-500"
        )}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive('italic') && "bg-blue-500/20 text-blue-500"
        )}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive('bulletList') && "bg-blue-500/20 text-blue-500"
        )}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
} 