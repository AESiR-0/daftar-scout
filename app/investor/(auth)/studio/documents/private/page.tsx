"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Download, Eye, Trash2, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const documents = [
  {
    id: "1",
    name: "Business Plan.pdf",
    uploadedBy: "John Smith",
    daftar: "Tech Innovation Fund",
    uploadedAt: "2024-03-20T14:30:00"
  },
  {
    id: "2",
    name: "Financial Projections.xlsx",
    uploadedBy: "Sarah Johnson",
    daftar: "Venture Capital LLC",
    uploadedAt: "2024-03-19T10:15:00"
  }
]

export default function PrivateDocumentsPage() {
  return (
    <div className="space-y-6 container mx-auto px-4">
    <ScrollArea className="h-[calc(100vh-7rem)]">
      <div className="space-y-4">
        {/* Header with Search and Upload */}
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents" className="pl-8" />
          </div>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

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
                    <span>Uploaded by {doc.uploadedBy}</span>
                    <span>•</span>
                    <span>{doc.daftar}</span>
                    <span>•</span>
                    <span>{new Date(doc.uploadedAt).toLocaleString()}</span>
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-red-500" />
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