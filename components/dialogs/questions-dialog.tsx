"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Plus, ListPlus, Trash2, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionList {
  id: string
  name: string
  questions: string[]
}

interface QuestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuestionsDialog({ open, onOpenChange }: QuestionsDialogProps) {
  const [activeList, setActiveList] = useState<string | null>(null)
  const [lists, setLists] = useState<QuestionList[]>([])
  const [newListName, setNewListName] = useState("")
  const [newQuestion, setNewQuestion] = useState("")

  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList: QuestionList = {
        id: Date.now().toString(),
        name: newListName,
        questions: []
      }
      setLists([...lists, newList])
      setActiveList(newList.id)
      setNewListName("")
    }
  }

  const handleAddQuestion = () => {
    if (activeList && newQuestion.trim()) {
      setLists(lists.map(list =>
        list.id === activeList
          ? { ...list, questions: [...list.questions, newQuestion] }
          : list
      ))
      setNewQuestion("")
    }
  }

  const handleDeleteList = () => {
    if (activeList) {
      setLists(lists.filter(list => list.id !== activeList))
      setActiveList(null)
    }
  }

  const handleSaveList = () => {
    console.log("Saving list:", lists.find(l => l.id === activeList))
  }

  const handleAddToPitch = () => {
    console.log("Adding to pitch:", lists.find(l => l.id === activeList))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>Questions</DialogTitle>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <div className="flex h-[28rem]">
          {/* Side Navigation */}
          <div className="w-52 border-r p-2 space-y-3 bg-muted/10">
            <div className="flex items-center gap-2 px-2">
              <div className="p-1.5 rounded-[0.3rem] bg-accent/50 text-accent-foreground">
                <ListPlus className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold">Question Lists</h2>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Enter list name to be created"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                onClick={handleCreateList}
                className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create List
              </Button>
            </div>

            <div className="space-y-1">
              {lists.map((list) => (
                <Button
                  key={list.id}
                  variant={activeList === list.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start rounded-[0.3rem] py-2 text-sm",
                    activeList === list.id
                      ? "bg-accent"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActiveList(list.id)}
                >
                  {list.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {activeList && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add Question</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter question"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="h-9"
                      />
                      <Button
                        onClick={handleAddQuestion}
                        className="bg-blue-600 hover:bg-blue-700 text-xs text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Questions</Label>
                    <div className="space-y-2">
                      {lists.find(l => l.id === activeList)?.questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground bg-muted/50 rounded-[0.3rem]">
                          <p>No questions added yet</p>
                          <p>Add questions to create your pitch list</p>
                        </div>
                      ) : (
                        lists.find(l => l.id === activeList)?.questions.map((question, index) => (
                          <div
                            key={index}
                            className="flex gap-3 items-start p-3 rounded-[0.3rem] bg-muted/50"
                          >
                            <span className="text-xs font-medium text-blue-600 mt-0.5">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="text-sm">{question}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteList}
                      className="h-8 text-xs text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveList}
                      className="h-8 text-xs"
                    >
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddToPitch}
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add to Pitch
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 