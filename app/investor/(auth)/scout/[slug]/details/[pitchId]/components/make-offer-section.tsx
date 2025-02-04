"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { MenuBar } from './menu-bar'

interface MakeOfferSectionProps {
  onSubmit: (content: string) => Promise<void>
}

export function MakeOfferSection({ onSubmit }: MakeOfferSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: `
      <h2>Investment Offer</h2>
      <p>Dear Founder,</p>
      <p>After careful consideration of your pitch, I would like to propose the following investment terms:</p>
      <ul>
        <li>Investment Amount:</li>
        <li>Equity Percentage:</li>
        <li>Valuation:</li>
        <li>Investment Structure:</li>
      </ul>
      <p>Additional terms and conditions:</p>
      <p></p>
      <p>Best regards,</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-invert min-h-[300px] focus:outline-none',
      },
    },
  })

  const handleSubmit = async () => {
    if (!editor?.getHTML()) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(editor.getHTML())
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full border-none my-0 p-0 bg-[#0e0e0e]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Make an Offer</CardTitle>
        <CardDescription>
          Write your investment offer to the founder. Be clear about your terms and conditions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-4 bg-[#1f1f1f] rounded-lg">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Sending..." : "Make the Offer"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 