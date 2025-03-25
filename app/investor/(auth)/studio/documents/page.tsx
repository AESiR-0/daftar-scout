"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Eye, Search, Upload, Trash2, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileHoverCard } from "@/components/ui/hover-card-profile"
import formatDate from "@/lib/formatDate"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Document {
  id: string
  name: string
  uploadedBy: string
  daftar: string
  scoutName: string
  uploadedAt: string
  type: "private" | "received" | "sent"
  size: string
  logs?: {
    action: string
    timestamp: string
    user: string
  }[]
  isHidden?: boolean
}

interface ActivityLog {
  id: string
  action: string
  documentName: string
  user: string
  timestamp: string
}

interface UserProfile {
  name: string
  designation: string
  email: string
  phone: string
  languages: string[]
  daftar: string
}

const dummyActivity: ActivityLog[] = [
  {
    id: "1",
    action: "Uploaded",
    documentName: "Business Plan.pdf",
    user: "John Smith",
    timestamp: formatDate("2024-03-20T14:30:00")
  },
  {
    id: "2",
    action: "Viewed",
    documentName: "Financial Projections.xlsx",
    user: "Sarah Johnson",
    timestamp: formatDate("2024-03-21T09:15:00")
  }
]

const userProfiles: Record<string, UserProfile> = {
  "John Smith": {
    name: "John Smith",
    designation: "Investment Director",
    email: "john.smith@techinnovation.com",
    phone: "+1 (555) 123-4567",
    languages: ["English", "Mandarin"],
    daftar: "Tech Innovation Fund"
  },
  "Sarah Johnson": {
    name: "Sarah Johnson",
    designation: "Senior Associate",
    email: "sarah.j@vcllc.com",
    phone: "+1 (555) 987-6543",
    languages: ["English", "French", "German"],
    daftar: "Venture Capital LLC"
  },
  "Mike Wilson": {
    name: "Mike Wilson",
    designation: "Investment Analyst",
    email: "mike.w@analysis.com",
    phone: "+1 (555) 456-7890",
    languages: ["English", "Spanish"],
    daftar: "Market Analysis Corp"
  }
}

export default function DocumentsPage() {
  const { toast } = useToast()
  const [documentsList, setDocumentsList] = useState<Document[]>([
    {
      id: "1",
      name: "Business Plan.pdf",
      uploadedBy: "John Smith",
      daftar: "Tech Innovation Fund",
      uploadedAt: formatDate("2024-03-20T14:30:00"),
      type: "private",
      size: "2.4 MB",
      scoutName: "innovation fund",
      isHidden: false,
      logs: [
        {
          action: "Uploaded",
          timestamp: formatDate("2024-03-20T14:30:00"),
          user: "John Smith"
        },
        {
          action: "Viewed",
          timestamp: formatDate("2024-03-21T09:15:00"),
          user: "Sarah Johnson"
        }
      ]
    },
    {
      id: "2",
      name: "Financial Projections.xlsx",
      uploadedBy: "Sarah Johnson",
      daftar: "Venture Capital LLC",
      uploadedAt: formatDate("2024-03-19T10:15:00"),
      type: "received",
      size: "1.8 MB",
      scoutName: "AI Fund",
    }
  ])

  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>(dummyActivity)

  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">("private")

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const privateCount = documentsList.filter(doc => doc.type === 'private').length
  const receivedCount = documentsList.filter(doc => doc.type === 'received').length
  const sentCount = documentsList.filter(doc => doc.type === 'sent').length

  const filteredDocuments = documentsList.filter(doc => doc.type === activeTab)

  const addActivityLog = (newActivity: Omit<ActivityLog, 'id'>) => {
    const activity: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      ...newActivity
    }
    setRecentActivity(prev => [activity, ...prev])
  }

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx,.xlsx'
    input.multiple = true

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        setSelectedFiles(files)
        setIsUploadModalOpen(true)
      }
    }

    input.click()
  }

  const handleUploadConfirm = (type: "private" | "sent") => {
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(file => {
        const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          uploadedBy: "John Smith",
          daftar: "Tech Innovation Fund",
          uploadedAt: formatDate(new Date().toISOString()),
          type: type,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          isHidden: false,
          scoutName: "AI Fund"
        }

        setDocumentsList(prev => [...prev, newDoc])
        addActivityLog({
          action: "Uploaded",
          documentName: file.name,
          user: "John Smith",
          timestamp: formatDate(new Date().toISOString())
        })
        toast({
          title: "File uploaded",
          description: `Successfully uploaded ${file.name}`
        })
      })
    }
    setIsUploadModalOpen(false)
    setSelectedFiles(null)
  }

  const handleDownload = (doc: Document) => {
    toast({
      title: "Downloading file",
      description: `Started downloading ${doc.name}`
    })
    addActivityLog({
      action: "Downloaded",
      documentName: doc.name,
      user: "John Smith",
      timestamp: formatDate("2024-03-19T10:15:00")
    })
  }

  const handleView = (doc: Document) => {
    toast({
      title: "Opening document",
      description: `Opening ${doc.name} for viewing`
    })
    addActivityLog({
      action: "Viewed",
      documentName: doc.name,
      user: "John Smith",
      timestamp: formatDate("2024-03-19T10:15:00")
    })
  }

  const handleDelete = (docId: string) => {
    const doc = documentsList.find(d => d.id === docId)
    if (doc) {
      setDocumentsList(prev => prev.filter(d => d.id !== docId))
      toast({
        title: "Document deleted",
        description: `Successfully deleted ${doc.name}`
      })
      addActivityLog({
        action: "Deleted",
        documentName: doc.name,
        user: "John Smith",
        timestamp: formatDate("2024-03-19T10:15:00")
      })
    }
  }

  const handleToggleVisibility = (docId: string) => {
    setDocumentsList(prev => prev.map(doc => {
      if (doc.id === docId) {
        const newVisibility = !doc.isHidden
        addActivityLog({
          action: newVisibility ? "Hidden" : "Unhidden",
          documentName: doc.name,
          user: "John Smith",
          timestamp: formatDate("2024-03-19T10:15:00")
        })
        toast({
          title: newVisibility ? "Document hidden" : "Document visible",
          description: `${doc.name} is now ${newVisibility ? "hidden" : "visible"}`
        })
        return { ...doc, isHidden: newVisibility }
      }
      return doc
    }))
  }

  return (
    <>
      <div className="flex px-5 mt-10 gap-6">
        <Card className="border-none bg-[#0e0e0e] flex-1">
          <CardContent className="space-y-6">
            <Tabs defaultValue="private" onValueChange={(value: typeof activeTab) => setActiveTab(value as typeof activeTab)}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="private" className="flex items-center gap-2">
                    Private
                    <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                      {privateCount}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="received" className="flex items-center gap-2">
                    Received
                    <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                      {receivedCount}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-2">
                    Sent
                    <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                      {sentCount}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <Button variant="outline" onClick={handleUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>

              <TabsContent value="private" className="space-y-4">
                <DocumentsList
                  documents={filteredDocuments}
                  canDelete={activeTab === "private"}
                  onDownload={handleDownload}
                  onView={handleView}
                  onDelete={handleDelete}
                  onToggleVisibility={handleToggleVisibility}
                />
              </TabsContent>

              <TabsContent value="received" className="space-y-4">
                <DocumentsList
                  documents={filteredDocuments}
                  canDelete={false}
                  onDownload={handleDownload}
                  onView={handleView}
                  onDelete={handleDelete}
                  onToggleVisibility={handleToggleVisibility}
                />
              </TabsContent>

              <TabsContent value="sent" className="space-y-4">
                <DocumentsList
                  documents={filteredDocuments}
                  canDelete={false}
                  onDownload={handleDownload}
                  onView={handleView}
                  onDelete={handleDelete}
                  onToggleVisibility={handleToggleVisibility}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Choose how you want to share these documents
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="outline"
              className="flex py-2 flex-col items-center justify-center h-24 space-y-1"
              onClick={() => handleUploadConfirm("private")}
            >
              <EyeOff className="h-6 w-6" />
              <span>Keep Private</span>
              <span className="text-xs text-muted-foreground">Only visible to your Daftar</span>
            </Button>

            <Button
              variant="outline"
              className="flex py-2 flex-col items-center justify-center h-24 space-y-1"
              onClick={() => handleUploadConfirm("sent")}
            >
              <Upload className="h-6 w-6" />
              <span>Send to Investors</span>
              <span className="text-xs text-muted-foreground">Share with all investors</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DocumentsList({
  documents,
  canDelete = false,
  onDownload,
  onView,
  onDelete,
  onToggleVisibility
}: {
  documents: Document[],
  canDelete?: boolean,
  onDownload: (doc: Document) => void,
  onView: (doc: Document) => void,
  onDelete: (docId: string) => void,
  onToggleVisibility: (docId: string) => void
}) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No documents found
      </div>
    )
  }

  const renderMetadata = (doc: Document) => {
    switch (doc.type) {
      case 'private':
        return (
          <>
            <span>Uploaded by {doc.uploadedBy}</span>
            <div>{formatDate(doc.uploadedAt)}</div>
          </>
        )
      case 'received':
        return (
          <>
            <span>From Scout: {doc.scoutName}</span>
            <div>{formatDate(doc.uploadedAt)}</div>
          </>
        )
      case 'sent':
        return (
          <>
            <span>Uploaded by {doc.uploadedBy}</span>
            <span>{doc.daftar}</span>
            <div>{formatDate(doc.uploadedAt)}</div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={`bg-[#1a1a1a] p-6 rounded-[0.35rem] ${doc.isHidden ? 'opacity-50' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8" />
                <div>
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-xs text-muted-foreground">{doc.size}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(doc)}
                className="hover:bg-muted/50"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(doc)}
                className="hover:bg-muted/50"
              >
                <Eye className={`h-4 w-4 ${doc.isHidden ? 'text-muted-foreground' : ''}`} />
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/50"
                  onClick={() => onDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            {renderMetadata(doc)}
          </div>
        </div>
      ))}
    </div>
  )
} 