"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Scroll, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

interface FAQ {
  id: string
  question: string
  answer: string
}

interface FAQsDetails {
  faqs: FAQ[]
}

function FaqsContent() {
  const pathname = usePathname()
  const mode = pathname.split('/')[3]
  const programId = pathname.split('/')[4]
  const [details, setDetails] = useState<FAQsDetails>({
    faqs: []
  })
  const router = useRouter()
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")

  useEffect(() => {
    if (mode === 'edit' && programId) {
      fetchFAQsDetails(programId)
    }
  }, [mode, programId])

  const fetchFAQsDetails = async (id: string) => {
    // Simulate API call
    const data = {
      faqs: [
        { question: "What is this program?", answer: "This is a startup program..." }
      ]
    }
    setDetails(data as FAQsDetails)
  }

  const handleAddFAQ = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      const newFAQ: FAQ = {
        id: Date.now().toString(),
        question: newQuestion,
        answer: newAnswer
      }
      setDetails(prevDetails => ({
        ...prevDetails,
        faqs: [...prevDetails.faqs, newFAQ]
      }))
      setNewQuestion("")
      setNewAnswer("")
    }
  }

  const handleDeleteFAQ = (id: string) => {
    setDetails(prevDetails => ({
      ...prevDetails,
      faqs: prevDetails.faqs.filter(faq => faq.id !== id)
    }))
  }

  const handleSave = async () => {
    if (mode === 'edit') {
      console.log("Updating FAQs:", programId, details)
    } else {
      console.log("Creating FAQs:", details)
    }
    router.push("/investor/studio/invite")
  }

  return (
    <div className="space-y-6 container mx-auto px-4">
      <ScrollArea className="gap-8 h-[calc(100vh-11rem)]">
        <div>
          <h1 className="text-2xl font-semibold">
            {mode === 'edit' ? 'Edit FAQs' : 'Add FAQs'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'edit' ? 'Update program FAQs' : 'Add program FAQs'}
          </p>
        </div>

        <ScrollArea className="gap-8 h-[calc(100vh-11rem)]">
          <div className="max-w-6xl">
            {/* Add FAQ Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  placeholder="Enter FAQ question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  placeholder="Enter FAQ answer"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* FAQs List */}
            <div className="space-y-4">
              {details.faqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground bg-muted/50 rounded-[0.3rem]">
                  <p>No FAQs added yet</p>
                  <p>Add questions and answers above</p>
                </div>
              ) : (
                details.faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className="space-y-2 p-4 rounded-[0.3rem] bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-600">
                            Q{String(index + 1).padStart(2, '0')}
                          </span>
                          <p className="font-medium">{faq.question}</p>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          {faq.answer}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFAQ(faq.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-center gap-2 pt-4">
              <Button
                onClick={handleAddFAQ}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add FAQ
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                {mode === 'edit' ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </ScrollArea>
    </div>
  )
}

export default FaqsContent;