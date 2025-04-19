"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Eye,
  Search,
  Upload,
  Trash2,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileHoverCard } from "@/components/ui/hover-card-profile";
import formatDate from "@/lib/formatDate";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Interface for the Document, aligned with API response
interface Document {
  id: string;
  name: string; // Maps to docName from API
  uploadedBy: string; // Maps to uploadedBy user ID or name
  daftar: string; // Placeholder, replace with actual data
  scoutName?: string; // For received documents from scouts
  uploadedAt: string; // Maps to createdAt from API
  type: "private" | "received" | "sent";
  size: string; // Calculated on client or from API
  isHidden?: boolean; // Maps to isPrivate from API
}

// Interface for Activity Log (local-only)
interface ActivityLog {
  id: string;
  action: string;
  documentName: string;
  user: string;
  timestamp: string;
}

export default function DocumentsSection({
  pitchId,
  scoutId,
}: {
  pitchId: string;
  scoutId: string;
}) {
  const { toast } = useToast();
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">(
    "private"
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch documents from API
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ scoutId, pitchId });
      const response = await fetch(
        `/api/endpoints/pitch/investor/documents?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for auth
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch documents");
      }

      const { sent, received } = data;

      // Map API response to Document interface
      const sentDocs: Document[] = sent.map((doc: any) => ({
        id: doc.id,
        name: doc.docName,
        uploadedBy: doc.uploadedBy, // Replace with user name if API provides it
        daftar: "Tech Innovation Fund", // Replace with actual daftar data
        uploadedAt: formatDate(doc.createdAt),
        type: doc.isPrivate ? "private" : "sent",
        size: "Unknown", // Calculate or get from API
        isHidden: doc.isPrivate,
      }));

      const receivedDocs: Document[] = received.map((doc: any) => ({
        id: doc.id,
        name: doc.docName || doc.name, // Handle scoutDocuments vs pitchDocs
        uploadedBy: doc.uploadedBy || "Scout", // Replace with user/scout name
        daftar: "Tech Innovation Fund", // Replace with actual daftar data
        scoutName: doc.scoutId ? "AI Fund" : undefined, // Replace with scout name
        uploadedAt: formatDate(doc.createdAt),
        type: "received",
        size: "Unknown", // Calculate or get from API
        isHidden: doc.isPrivate,
      }));

      setDocumentsList([...sentDocs, ...receivedDocs]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch documents on mount and when activeTab changes
  useEffect(() => {
    fetchDocuments();
  }, [activeTab, pitchId, scoutId]);

  const privateCount = documentsList.filter(
    (doc) => doc.type === "private"
  ).length;
  const receivedCount = documentsList.filter(
    (doc) => doc.type === "received"
  ).length;
  const sentCount = documentsList.filter((doc) => doc.type === "sent").length;

  const filteredDocuments = documentsList.filter(
    (doc) => doc.type === activeTab
  );

  const addActivityLog = (newActivity: Omit<ActivityLog, "id">) => {
    const activity: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      ...newActivity,
    };
    setRecentActivity((prev) => [activity, ...prev]);
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.xlsx";
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setSelectedFiles(files);
        setIsUploadModalOpen(true);
      }
    };

    input.click();
  };

  const handleUploadConfirm = async (type: "private" | "sent") => {
    if (!selectedFiles) return;

    try {
      setIsLoading(true);
      for (const file of Array.from(selectedFiles)) {
        // Simulate file upload to a storage service (e.g., S3) to get docUrl
        const docUrl = `https://storage.example.com/${file.name}`; // Replace with actual upload logic
        const docType = file.type || file.name.split(".").pop() || "unknown";

        // Call POST API to save document metadata
        const response = await fetch(
          "/api/endpoints/pitch/investor/documents",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pitchId,
              docName: file.name,
              docType,
              docUrl,
              isPrivate: type === "private",
            }),
            credentials: "include", // Include cookies for auth
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to upload document");
        }

        const newDoc: Document = {
          id: data[0].id,
          name: file.name,
          uploadedBy: "John Smith", // Replace with actual user data
          daftar: "Tech Innovation Fund", // Replace with actual daftar data
          uploadedAt: formatDate(new Date().toISOString()),
          type: type === "private" ? "private" : "sent",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          isHidden: type === "private",
        };

        setDocumentsList((prev) => [...prev, newDoc]);
        addActivityLog({
          action: "Uploaded",
          documentName: file.name,
          user: "John Smith",
          timestamp: formatDate(new Date().toISOString()),
        });
        toast({
          title: "File uploaded",
          description: `Successfully uploaded ${file.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsUploadModalOpen(false);
      setSelectedFiles(null);
    }
  };

  const handleDownload = (doc: Document) => {
    // Simulate download (replace with actual download logic)
    toast({
      title: "Downloading file",
      description: `Started downloading ${doc.name}`,
    });
    addActivityLog({
      action: "Downloaded",
      documentName: doc.name,
      user: "John Smith",
      timestamp: formatDate(new Date().toISOString()),
    });
  };

  const handleView = (doc: Document) => {
    // Simulate view (replace with actual view logic)
    toast({
      title: "Opening document",
      description: `Opening ${doc.name} for viewing`,
    });
    addActivityLog({
      action: "Viewed",
      documentName: doc.name,
      user: "John Smith",
      timestamp: formatDate(new Date().toISOString()),
    });
  };

  const handleDelete = async (docId: string) => {
    // Note: No DELETE endpoint provided, so this is local-only
    const doc = documentsList.find((d) => d.id === docId);
    if (doc) {
      setDocumentsList((prev) => prev.filter((d) => d.id !== docId));
      toast({
        title: "Document deleted",
        description: `Successfully deleted ${doc.name}`,
      });
      addActivityLog({
        action: "Deleted",
        documentName: doc.name,
        user: "John Smith",
        timestamp: formatDate(new Date().toISOString()),
      });
    }
  };

  const handleToggleVisibility = (docId: string) => {
    // Note: No PATCH endpoint provided, so this is local-only
    setDocumentsList((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const newVisibility = !doc.isHidden;
          addActivityLog({
            action: newVisibility ? "Hidden" : "Unhidden",
            documentName: doc.name,
            user: "John Smith",
            timestamp: formatDate(new Date().toISOString()),
          });
          toast({
            title: newVisibility ? "Document hidden" : "Document visible",
            description: `${doc.name} is now ${
              newVisibility ? "hidden" : "visible"
            }`,
          });
          return { ...doc, isHidden: newVisibility };
        }
        return doc;
      })
    );
  };

  return (
    <>
      <div className="flex p-0 mt-10 gap-6">
        <Card className="border-none bg-[#0e0e0e] flex-1">
          <CardContent className="space-y-6">
            {isLoading && <div>Loading documents...</div>}
            <Tabs
              defaultValue="private"
              onValueChange={(value: string) =>
                setActiveTab(value as typeof activeTab)
              }
            >
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger
                    value="private"
                    className="flex items-center gap-2"
                  >
                    Private
                    <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                      {privateCount}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="received"
                    className="flex items-center gap-2"
                  >
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

                <Button
                  variant="outline"
                  className="rounded-[0.35rem]"
                  onClick={handleUpload}
                  disabled={isLoading}
                >
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
              disabled={isLoading}
            >
              <EyeOff className="h-6 w-6" />
              <span>Keep Private</span>
              <span className="text-xs text-muted-foreground">
                Only visible to your Daftar
              </span>
            </Button>

            <Button
              variant="outline"
              className="flex py-2 flex-col items-center justify-center h-24 space-y-1"
              onClick={() => handleUploadConfirm("sent")}
              disabled={isLoading}
            >
              <Upload className="h-6 w-6" />
              <span>Send to Investors</span>
              <span className="text-xs text-muted-foreground">
                Share with all investors
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DocumentsList({
  documents,
  canDelete = false,
  onDownload,
  onView,
  onDelete,
  onToggleVisibility,
}: {
  documents: Document[];
  canDelete?: boolean;
  onDownload: (doc: Document) => void;
  onView: (doc: Document) => void;
  onDelete: (docId: string) => void;
  onToggleVisibility: (docId: string) => void;
}) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No documents found
      </div>
    );
  }

  const renderMetadata = (doc: Document) => {
    switch (doc.type) {
      case "private":
        return (
          <>
            <span>Uploaded by {doc.uploadedBy}</span>
            <div>{formatDate(doc.uploadedAt)}</div>
          </>
        );
      case "received":
        return (
          <>
            <span>From Scout: {doc.scoutName || "Unknown"}</span>
            <div>{formatDate(doc.uploadedAt)}</div>
          </>
        );
      case "sent":
        return (
          <>
            <span>Uploaded by {doc.uploadedBy}</span>
            <span>{doc.daftar}</span>
            <div>{formatDate(doc.uploadedAt)}</div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <div
          key={index}
          className={`bg-[#1a1a1a] p-6 rounded-[0.35rem] ${
            doc.isHidden ? "opacity-50" : ""
          }`}
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
                <Eye
                  className={`h-4 w-4 ${
                    doc.isHidden ? "text-muted-foreground" : ""
                  }`}
                />
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
  );
}
