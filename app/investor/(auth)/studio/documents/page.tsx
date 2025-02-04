"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Eye, Search, Upload, Trash2, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ProfileHoverCard } from "@/components/ui/hover-card-profile"
import { Mail, Phone, Languages } from "lucide-react"
import formatDate from "@/lib/formatDate"
import { useToast } from "@/hooks/use-toast"

interface Document {
  id: string
  name: string
  uploadedBy: string
  daftar: string
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

const documents: Document[] = [
  {
    id: "1",
    name: "Business Plan.pdf",
    uploadedBy: "John Smith",
    daftar: "Tech Innovation Fund",
    uploadedAt: formatDate("2024-03-20T14:30:00"),
    type: "private",
    size: "2.4 MB",
    isHidden: false,
    logs: [
      {
        action: "Uploaded",
        timestamp: "2024-03-20T14:30:00",
        user: "John Smith"
      },
      {
        action: "Viewed",
        timestamp: "2024-03-21T09:15:00",
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
    size: "1.8 MB"
  }
]

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
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Business Plan.pdf",
      uploadedBy: "John Smith",
      daftar: "Tech Innovation Fund",
      uploadedAt: formatDate("2024-03-20T14:30:00"),
      type: "private",
      size: "2.4 MB",
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
      size: "1.8 MB"
    }
  ])

  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>(dummyActivity)

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">("private")

  const filteredDocuments = documents.filter(doc =>
    doc.type === activeTab &&
    (doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
      if (files) {
        Array.from(files).forEach(file => {
          const newDoc: Document = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            uploadedBy: "John Smith",
            daftar: "Tech Innovation Fund",
            uploadedAt: new Date().toISOString(),
            type: "private",
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            isHidden: false
          }

          setDocuments(prev => [...prev, newDoc])
          addActivityLog({
            action: "Uploaded",
            documentName: file.name,
            user: "John Smith",
            timestamp: new Date().toISOString()
          })
          toast({
            title: "File uploaded",
            description: `Successfully uploaded ${file.name}`
          })
        })
      }
    }

    input.click()
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
      timestamp: new Date().toISOString()
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
      timestamp: new Date().toISOString()
    })
  }

  const handleDelete = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    if (doc) {
      setDocuments(prev => prev.filter(d => d.id !== docId))
      toast({
        title: "Document deleted",
        description: `Successfully deleted ${doc.name}`
      })
      addActivityLog({
        action: "Deleted",
        documentName: doc.name,
        user: "John Smith",
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleToggleVisibility = (docId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const newVisibility = !doc.isHidden
        addActivityLog({
          action: newVisibility ? "Hidden" : "Unhidden",
          documentName: doc.name,
          user: "John Smith",
          timestamp: new Date().toISOString()
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
    <div className="flex gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
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

      <Card className="border-none bg-[#0e0e0e] w-80">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col space-y-2 pb-4 border-b last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activity.action === "Uploaded" && <Upload className="h-4 w-4 text-green-500" />}
                    {activity.action === "Downloaded" && <Download className="h-4 w-4 text-blue-500" />}
                    {activity.action === "Viewed" && <Eye className="h-4 w-4 text-yellow-500" />}
                    <span className="text-sm font-medium">{activity.action}</span>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </time>
                </div>
                <div className="text-sm text-muted-foreground">
                  <ProfileHoverCard
                    {...(userProfiles[activity.user] || {
                      name: activity.user,
                      designation: "Team Member",
                      email: "contact@example.com",
                      phone: "+1 (555) 000-0000",
                      languages: ["English"],
                      daftar: ""
                    })}
                  >
                    <span className="cursor-pointer hover:text-blue-600">{activity.user}</span>
                  </ProfileHoverCard>
                  {' '}
                  {activity.action.toLowerCase()} {' '}
                  <span className="font-medium text-foreground">
                    {activity.documentName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
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

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={`flex flex-col p-4 border rounded-lg hover:border-blue-600 transition-colors ${doc.isHidden ? 'opacity-50' : ''
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ProfileHoverCard
                    {...userProfiles[doc.uploadedBy]}
                  >
                    <span className="cursor-pointer hover:text-blue-600">{doc.uploadedBy}</span>
                  </ProfileHoverCard>
                  <span>•</span>
                  <ProfileHoverCard name={doc.daftar} daftar={doc.daftar}>
                    <span className="cursor-pointer hover:text-blue-600">{doc.daftar}</span>
                  </ProfileHoverCard>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{new Date(doc.uploadedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(doc)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(doc)}
              >
                <Eye className={`h-4 w-4 ${doc.isHidden ? 'text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleVisibility(doc.id)}
              >
                {doc.isHidden ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={() => onDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {doc.logs && doc.logs.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <p className="text-xs font-medium mb-2">Activity Log</p>
              <div className="space-y-2">
                {doc.logs.map((log, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{log.action}</span>
                    <span>by</span>
                    <ProfileHoverCard
                      {...(userProfiles[log.user] || {
                        name: log.user,
                        designation: "Team Member",
                        email: "contact@example.com",
                        phone: "+1 (555) 000-0000",
                        languages: ["English"],
                        daftar: ""
                      })}
                    >
                      <span className="cursor-pointer hover:text-blue-600">{log.user}</span>
                    </ProfileHoverCard>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 