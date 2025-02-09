"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Eye, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const documents = [
  {
    id: "1",
    name: "Pitch Deck.pdf",
    sentBy: "John Smith",
    daftar: "Tech Innovation Fund",
    sentAt: "2024-03-20T14:30:00"
  },
  {
    id: "2",
    name: "Market Analysis.pdf",
    sentBy: "Sarah Johnson",
    daftar: "Venture Capital LLC",
    sentAt: "2024-03-19T10:15:00"
  }
]

export default function SentDocumentsPage() {
  return (
    <div className="space-y-6 container mx-auto px-4">
      <ScrollArea className="h-[calc(100vh-7rem)]">
        <div className="space-y-4">
          {/* Documents List */}
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-[0.3rem]"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Sent by {doc.sentBy}</span>
                    <span>•</span>
                    <span>{doc.daftar}</span>
                    <span>•</span>
                    <span>{new Date(doc.sentAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 