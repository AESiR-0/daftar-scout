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
import { uploadInvestorPitchDocument, deleteFounderPitchDocument } from "@/lib/actions/document";

// Interface for the Document, aligned with API response
interface Document {
  id: string;
  name: string;
  uploadedBy: string;
  daftar: {
    id: string;
    name: string;
  };
  uploadedAt: string;
  type: "private" | "received" | "sent";
  size: string;
  docUrl: string;
  isHidden?: boolean;
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
  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">("private");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch documents from API
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ pitchId });
      const response = await fetch(
        `/api/endpoints/pitch/investor/documents?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch documents");
      }

      const { sent, received } = data;

      // Map API response to Document interface
      const sentDocs: Document[] = await Promise.all(sent.map(async (doc: any) => {
        // Fetch user info
        const userResponse = await fetch(`/api/endpoints/users/info?userId=${doc.uploadedBy}`);
        const userData = await userResponse.json();

        return {
          id: doc.id,
          name: doc.docName,
          docUrl: doc.docUrl || "",
          uploadedBy: userData ? userData.name : "Unknown",
          daftar: {
            id: userData?.daftarId || "unknown",
            name: userData?.daftarName || "Unknown Daftar"
          },
          uploadedAt: formatDate(doc.createdAt || doc.uploadedAt),
          type: doc.isPrivate ? "private" : "sent",
          size: doc.size ? formatFileSize(doc.size.toString()) : "Unknown",
          isHidden: doc.isPrivate,
        };
      }));

      const receivedDocs: Document[] = await Promise.all(received.map(async (doc: any) => {
        // Fetch user info
        const userResponse = await fetch(`/api/endpoints/users/info?userId=${doc.uploadedBy}`);
        const userData = await userResponse.json();

        return {
          id: doc.id,
          name: doc.docName || doc.name,
          docUrl: doc.docUrl || "",
          uploadedBy: userData ? userData.name : "Unknown",
          daftar: {
            id: userData?.daftarId || "unknown",
            name: userData?.daftarName || "Unknown Daftar"
          },
          uploadedAt: formatDate(doc.createdAt || doc.uploadedAt),
          type: "received",
          size: doc.size ? formatFileSize(doc.size.toString()) : "Unknown",
          isHidden: doc.isPrivate,
        };
      }));

      setDocumentsList([...sentDocs, ...receivedDocs]);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch documents on mount and when activeTab changes
  useEffect(() => {
    fetchDocuments();
  }, [activeTab, pitchId]);

  const privateCount = documentsList.filter((doc) => doc.type === "private").length;
  const receivedCount = documentsList.filter((doc) => doc.type === "received").length;
  const sentCount = documentsList.filter((doc) => doc.type === "sent").length;

  const filteredDocuments = documentsList.filter((doc) => doc.type === activeTab);

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
      setIsUploading(true);
      for (const file of Array.from(selectedFiles)) {
        // Upload to storage and get URL
        const docUrl = await uploadInvestorPitchDocument(file, pitchId);

        // Create document record
        const response = await fetch("/api/endpoints/pitch/investor/documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pitchId,
            docName: file.name,
            docType: file.type || file.name.split(".").pop(),
            docUrl,
            size: file.size,
            isPrivate: type === "private",
          }),
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to upload document");
        }

        const [insertedDoc] = await response.json();

        // Fetch user info
        const userResponse = await fetch(`/api/endpoints/users/info?userId=${insertedDoc.uploadedBy}`);
        const userData = await userResponse.json();

        const newDoc: Document = {
          id: insertedDoc.id,
          name: insertedDoc.docName,
          docUrl: insertedDoc.docUrl || "",
          uploadedBy: userData ? userData.name : "Unknown",
          daftar: {
            id: userData?.daftarId || "unknown",
            name: userData?.daftarName || "Unknown Daftar"
          },
          uploadedAt: formatDate(insertedDoc.uploadedAt || new Date().toISOString()),
          type: type === "private" ? "private" : "sent",
          size: formatFileSize(insertedDoc.size.toString()),
          isHidden: insertedDoc.isPrivate,
        };

        setDocumentsList((prev) => [newDoc, ...prev]);
        toast({
          title: "Success",
          description: `Successfully uploaded ${file.name}`,
        });
      }
    } catch (error: any) {
      console.error("Error uploading documents:", error);
      toast({
        title: "Error",
        description: `Failed to upload document: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setSelectedFiles(null);
    }
  };

  const handleDownload = (doc: Document) => {
    if (!doc.docUrl) {
      toast({
        title: "Error",
        description: "Document URL not found",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Downloading file",
      description: `Started downloading ${doc.name}`,
    });
    window.open(doc.docUrl, "_blank");
  };

  const handleView = (doc: Document) => {
    if (!doc.docUrl) {
      toast({
        title: "Error",
        description: "Document URL not found",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Opening document",
      description: `Opening ${doc.name} for viewing`,
    });
    window.open(doc.docUrl, "_blank");
  };

  const handleDelete = async (docId: string) => {
    try {
      const doc = documentsList.find((d) => d.id === docId);
      if (!doc) return;

      // First confirm with the user
      if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
        return;
      }

      // First delete from storage
      if (doc.docUrl) {
        try {
          await deleteFounderPitchDocument(doc.docUrl);
        } catch (error) {
          console.error("Error deleting from storage:", error);
          toast({
            title: "Error",
            description: "Failed to delete file from storage",
            variant: "destructive",
          });
          return;
        }
      }

      // Then delete from database
      const response = await fetch(`/api/endpoints/pitch/investor/documents?id=${docId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete document");
      }

      setDocumentsList((prev) => prev.filter((d) => d.id !== docId));
      toast({
        title: "Document deleted",
        description: `Successfully deleted ${doc.name}`,
      });
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: `Failed to delete document: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (docId: string) => {
    try {
      const doc = documentsList.find((d) => d.id === docId);
      if (!doc) return;

      const response = await fetch(`/api/endpoints/pitch/investor/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: !doc.isHidden }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle visibility");
      }

      setDocumentsList((prev) =>
        prev.map((d) => {
          if (d.id === docId) {
            const newVisibility = !d.isHidden;
            toast({
              title: newVisibility ? "Document hidden" : "Document visible",
              description: `${d.name} is now ${newVisibility ? "hidden" : "visible"}`,
            });
            return { ...d, isHidden: newVisibility, type: newVisibility ? "private" : d.type };
          }
          return d;
        })
      );
    } catch (error: any) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Error",
        description: `Failed to toggle visibility: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex p-0 mt-10 gap-6">
        <Card className="border-none bg-[#0e0e0e] flex-1">
          <CardContent className="space-y-6">
            {isLoading && <div>Loading documents...</div>}
            <Tabs
              defaultValue="private"
              onValueChange={(value: string) => setActiveTab(value as typeof activeTab)}
            >
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

                <Button
                  variant="outline"
                  className="rounded-[0.35rem]"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <>
                  <TabsContent value="private">
                    <DocumentsList
                      documents={filteredDocuments}
                      canDelete={true}
                      onDownload={handleDownload}
                      onView={handleView}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      emptyMessage="No private documents uploaded yet. These will be visible to scout members only."
                    />
                  </TabsContent>

                  <TabsContent value="received">
                    <DocumentsList
                      documents={filteredDocuments}
                      canDelete={false}
                      onDownload={handleDownload}
                      onView={handleView}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      emptyMessage="No documents received from founders yet"
                    />
                  </TabsContent>

                  <TabsContent value="sent">
                    <DocumentsList
                      documents={filteredDocuments}
                      canDelete={true}
                      onDownload={handleDownload}
                      onView={handleView}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      emptyMessage="No documents sent to founders yet"
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>Choose how you want to share these documents</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="outline"
              className="flex py-2 flex-col items-center justify-center h-24 space-y-1"
              onClick={() => handleUploadConfirm("private")}
              disabled={isUploading}
            >
              <EyeOff className="h-6 w-6" />
              <span>Keep Private</span>
              <span className="text-xs text-muted-foreground">Only visible to scout members</span>
            </Button>

            <Button
              variant="outline"
              className="flex py-2 flex-col items-center justify-center h-24 space-y-1"
              onClick={() => handleUploadConfirm("sent")}
              disabled={isUploading}
            >
              <Upload className="h-6 w-6" />
              <span>Send to Founder</span>
              <span className="text-xs text-muted-foreground">Share with the founder</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatFileSize(sizeInBytes: string): string {
  const bytes = parseInt(sizeInBytes);
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function DocumentsList({
  documents,
  canDelete = false,
  onDownload,
  onView,
  onDelete,
  onToggleVisibility,
  emptyMessage,
}: {
  documents: Document[];
  canDelete?: boolean;
  onDownload: (doc: Document) => void;
  onView: (doc: Document) => void;
  onDelete: (docId: string) => void;
  onToggleVisibility: (docId: string) => void;
  emptyMessage: string;
}) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={`bg-[#1a1a1a] p-6 rounded-[0.35rem] ${doc.isHidden ? "opacity-50" : ""}`}
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
                <Eye className="h-4 w-4" />
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
            <div>Uploaded by: {doc.uploadedBy}</div>
            <div>Daftar: {doc.daftar.name}</div>
            <div>Uploaded at: {doc.uploadedAt}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
