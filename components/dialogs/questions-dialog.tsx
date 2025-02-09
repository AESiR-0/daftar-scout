"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Question {
  id: number
  question: string
}

interface QuestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuestionsUpdate?: (questions: Question[], templateName: string) => void
  onApplyTemplate: (questions: Question[]) => void
  onDeleteTemplate?: (templateName: string) => void
  templates: Record<string, Question[]>
}

export function QuestionsDialog({
  open,
  onOpenChange,
  onQuestionsUpdate,
  onApplyTemplate,
  onDeleteTemplate,
  templates
}: QuestionsDialogProps) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([{ id: 1, question: "" }])
  const [templateName, setTemplateName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const addQuestion = () => {
    if (questions.length >= 6) {
      toast({
        title: "Maximum questions reached",
        description: "You can only have 6 questions",
        variant: "destructive"
      })
      return
    }
    setQuestions([...questions, { id: questions.length + 1, question: "" }])
  }

  const removeQuestion = (id: number) => {
    if (questions.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one question",
        variant: "destructive"
      })
      return
    }
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestion = (id: number, value: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, question: value } : q
    ))
  }

  const isValid = questions.length === 6 &&
    questions.every(q => q.question.trim()) &&
    templateName.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollArea>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl">Custom Questions</DialogTitle>
            <DialogDescription className="text-base">
              Create new questions or select from saved templates. All pitches require exactly 6 questions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-5 gap-6">
            {/* Left side - Template Management */}
            <div className="col-span-2 space-y-6">
              {/* Template Name Input */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Template Name</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="h-9"
                />
              </div>

              {/* Saved Templates */}
              {Object.entries(templates).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Saved Templates</h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {Object.entries(templates).map(([name, templateQuestions]) => (
                      <div
                        key={name}
                        className="p-3 border rounded-lg  transition-all"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              setSelectedTemplate(name)
                              setQuestions(templateQuestions)
                              setTemplateName(name)
                            }}
                          >
                            <p className="text-sm font-medium mb-1">{name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {templateQuestions[0].question}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteTemplate?.(name)
                            }}
                            className="h-8 w-8 "
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Question Editor */}
            <div className="col-span-3 space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Questions</h4>
                <div className="space-y-3">
                  {questions.map((q, index) => (
                    <div 
                      key={q.id} 
                      className="group flex items-center gap-3 bg-muted/50 p-3 rounded-lg transition-colors hover:bg-muted/70"
                    >
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Input
                        value={q.question}
                        onChange={(e) => updateQuestion(q.id, e.target.value)}
                        placeholder="Enter your question"
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(q.id)}
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 "
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {questions.length < 6 && (
                    <Button
                      variant="outline"
                      onClick={addQuestion}
                      className="w-full h-9"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between mt-6 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => onQuestionsUpdate?.(questions, templateName)}
                disabled={!isValid}
                className="s"
              >
                Save as Template
              </Button>
            </div>
            {selectedTemplate && (
              <Button
                onClick={() => onApplyTemplate(questions)}
                disabled={!isValid}
                className=""
              >
                Add to Pitch
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </ScrollArea>
    </Dialog>
  )
} 