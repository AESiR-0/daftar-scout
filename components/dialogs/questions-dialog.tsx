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
  onQuestionsUpdate?: (questions: Question[]) => void
  onApplyTemplate: (questions: Question[]) => void
  templates: Record<string, Question[]>
}

export function QuestionsDialog({
  open,
  onOpenChange,
  onQuestionsUpdate,
  onApplyTemplate,
  templates
}: QuestionsDialogProps) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([{ id: 1, question: "" }])
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

  const isValid = questions.length === 6 && questions.every(q => q.question.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollArea>

        <DialogContent style={{ scrollbarWidth: 'none' }} className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom Questions</DialogTitle>
            <DialogDescription>
              Create new questions or select from saved templates. All pitches require exactly 6 questions.
            </DialogDescription>
          </DialogHeader>
          {/* Template Selection */}
          {Object.entries(templates).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Saved Templates</h4>
              <div className="space-y-2">
                {Object.entries(templates).map(([name, templateQuestions]) => (
                  <div
                    key={name}
                    className="p-3 border rounded-lg cursor-pointer hover:border-blue-600"
                    onClick={() => {
                      setSelectedTemplate(name)
                      setQuestions(templateQuestions)
                    }}
                  >
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {templateQuestions[0].question}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Editor */}
          <div className="space-y-4 py-4">
            {questions.map((q, index) => (
              <div key={q.id} className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Input
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, e.target.value)}
                  placeholder="Enter your question"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(q.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {questions.length < 6 && (
              <Button
                variant="outline"
                onClick={addQuestion}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => onQuestionsUpdate?.(questions)}
                disabled={!isValid}
              >
                Save as Template
              </Button>
            </div>
            {selectedTemplate && (
              <Button
                onClick={() => onApplyTemplate(questions)}
                disabled={!isValid}
                className="bg-blue-600"
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