"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Eye, Search, Upload, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Document {
  id: string
  name: string
  uploadedBy: string
  daftar: string
  uploadedAt: string
  type: "private" | "received" | "sent"
  size: string
}

const documents: Document[] = [
  {
    id: "1",
    name: "Business Plan.pdf",
    uploadedBy: "John Smith",
    daftar: "Tech Innovation Fund",
    uploadedAt: "2024-03-20T14:30:00",
    type: "private",
    size: "2.4 MB"
  },
  {
    id: "2",
    name: "Financial Projections.xlsx",
    uploadedBy: "Sarah Johnson",
    daftar: "Venture Capital LLC",
    uploadedAt: "2024-03-19T10:15:00",
    type: "received",
    size: "1.8 MB"
  }
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">("private")

  const filteredDocuments = documents.filter(doc => 
    doc.type === activeTab && 
    (doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx,.xlsx'
    input.multiple = true
    input.click()
  }

  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="private" onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="private">Private</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-9 w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === "private" && (
                <Button variant="outline" onClick={handleUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="private" className="space-y-4">
            <DocumentsList documents={filteredDocuments} canDelete />
          </TabsContent>

          <TabsContent value="received" className="space-y-4">
            <DocumentsList documents={filteredDocuments} />
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <DocumentsList documents={filteredDocuments} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function DocumentsList({ documents, canDelete = false }: { documents: Document[], canDelete?: boolean }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No documents found
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{doc.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{doc.uploadedBy}</span>
                <span>•</span>
                <span>{doc.daftar}</span>
                <span>•</span>
                <span>{doc.size}</span>
                <span>•</span>
                <span>{new Date(doc.uploadedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
            {canDelete && (
              <Button 
                variant="ghost" 
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 