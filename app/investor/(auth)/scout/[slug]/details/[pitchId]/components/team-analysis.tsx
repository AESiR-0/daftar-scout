"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { MenuBar } from "./menu-bar"

interface TeamAnalysis {
  id: string
  analyst: {
    name: string
    role: string
    avatar: string
  }
  belief: 'yes' | 'no'
  note: string
  date: string
}

interface Profile {
  id: string
  name: string
  role: string
  avatar: string
}

interface TeamAnalysisSectionProps {
  teamAnalysis: TeamAnalysis[]
  currentProfile: Profile
  onSubmitAnalysis: (data: {
    belief: 'yes' | 'no'
    note: string
    analyst: Profile
  }) => Promise<void>
}

export function TeamAnalysisSection({ 
  teamAnalysis, 
  currentProfile, 
  onSubmitAnalysis 
}: TeamAnalysisSectionProps) {
  const [belief, setBelief] = useState<'yes' | 'no'>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

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

  const handleSubmit = async () => {
    if (!belief || editor?.isEmpty) return
    setIsSubmitting(true)
    try {
      await onSubmitAnalysis({
        belief,
        note: editor.getHTML(),
        analyst: currentProfile
      })
      setHasSubmitted(true)
      editor.commands.clearContent()
      // Show success message
    } catch (error) {
      // Show error message
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const believersCount = teamAnalysis.filter(a => a.belief === 'yes').length
  const totalAnalysts = teamAnalysis.length

  return (
    <Card className="w-full border-none my-0 p-0 bg-[#0e0e0e]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Team's Analysis</CardTitle>
        <CardDescription>
          Team members' analysis and feedback on the startup.
        </CardDescription>
      </CardHeader>
      <CardContent className="border-none">
        <div className="flex justify-between gap-10">
          {/* Left side - Your Analysis */}
          <div className="w-1/2">
            <Card className="border-none bg-[#0e0e0e]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Analysis</CardTitle>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentProfile.avatar} />
                      <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {currentProfile.name}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Do you believe in this startup?</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={belief === 'yes' ? 'default' : 'outline'}
                        onClick={() => setBelief('yes')}
                        className={belief === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={belief === 'no' ? 'default' : 'outline'}
                        onClick={() => setBelief('no')}
                        className={belief === 'no' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Your Analysis</Label>
                    <div className="border rounded-md">
                      <MenuBar editor={editor} />
                      <EditorContent editor={editor} className="w-full" />
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!belief || editor?.isEmpty || isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Team's Analysis */}
          <div className="w-1/2">
            <Card className="border-none bg-[#0e0e0e]">
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle>Team's Analysis</CardTitle>
                  <p className="text-sm text-blue-500">
                    Believers {believersCount} out of {totalAnalysts}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                {!hasSubmitted ? (
                  <div className="flex items-center justify-center h-[400px] text-sm text-muted-foreground">
                    Submit your analysis to see team's feedback
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6">
                      {teamAnalysis.map((analysis) => (
                        <div key={analysis.id} className="space-y-3 pb-4 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={analysis.analyst.avatar} />
                              <AvatarFallback>
                                {analysis.analyst.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <Button variant="link" className="h-auto text-white p-0">
                                    {analysis.analyst.name}
                                  </Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-60">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">
                                      {analysis.analyst.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {analysis.analyst.role}
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                              <p className="text-xs text-muted-foreground">
                                {new Date(analysis.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={analysis.belief === 'yes' ? 'success' : 'destructive'}>
                              {analysis.belief === 'yes' ? 'Believer' : 'Not convinced'}
                            </Badge>
                          </div>
                          <div
                            className="text-sm prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: analysis.note }}
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 