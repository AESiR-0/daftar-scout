"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Upload, Trash2, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import formatDate from "@/lib/formatDate";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { uploadInvestorPitchDocument } from "@/lib/actions/document";
import { useDaftar } from "@/lib/context/daftar-context";
import { usePathname } from "next/navigation";
import { getVideoUrl } from "@/lib/s3";

interface Document {
  id: string;
  name: string;
  uploadedBy: {
    id: string;
    name: string;
    daftarId: string;
  };
  daftar: {
    id: string;
    name: string;
  };
  url?: string;
  uploadedAt: string;
  type: "private" | "received" | "sent";
  documentType: "regular" | "pitchDocument";
  visibility: "private" | "investors_only";
  size: string;
  logs?: {
    action: string;
    timestamp: string;
    user: string;
  }[];
  isHidden?: boolean;
  isPrivate: boolean;
  isUploadedByCurrentUser: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  documentName: string;
  user: string;
  timestamp: string;
}

interface ApiDocument {
  id: string;
  docName: string;
  docUrl: string;
  docType: "regular" | "pitchDocument";
  size: number;
  scoutId: string;
  daftarId: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isPrivate: boolean;
  uploadedAt: string;
  daftarName: string;
}

const emptyStateMessages: Record<string, string> = {
  private: "No private documents uploaded yet. These will be visible to your daftar's investors only.",
  received: "No documents received from other investors yet.",
  sent: "No documents shared with other investors yet.",
};

export default function DocumentsPage() {
  const { toast } = useToast();
  const { selectedDaftar: daftarId } = useDaftar();
  const pathname = usePathname();
  const pitchId = pathname.split("/")[4];
  const scoutId = pathname.split("/")[3];
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">("private");
  const [isPrivate, setIsPrivate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setIsPrivate(activeTab === "private");
  }, [activeTab]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/endpoints/scouts/documents?scoutId=${scoutId}&daftarId=${daftarId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();

      // Handle empty data case
      if (!data || !Array.isArray(data)) {
        setDocumentsList([]);
        return;
      }

      const mappedDocuments: Document[] = data.map((doc: ApiDocument) => ({
        id: doc.id,
        name: doc.docName,
        uploadedBy: {
          id: doc.uploadedBy?.id || "unknown",
          name: doc.uploadedBy ? `${doc.uploadedBy.firstName || ''} ${doc.uploadedBy.lastName || ''}`.trim() || "Unknown User" : "Unknown User",
          daftarId: doc.daftarId
        },
        daftar: {
          id: doc.daftarId,
          name: doc.daftarName || "Unknown Daftar"
        },
        url: doc.docUrl,
        uploadedAt: formatDate(doc.uploadedAt),
        type: doc.isPrivate ? "private" : "sent",
        size: `${(doc.size / (1024 * 1024)).toFixed(3)} MB`,
        isHidden: false,
        documentType: doc.docType as "regular" | "pitchDocument",
        visibility: doc.isPrivate ? "private" : "investors_only",
        isPrivate: doc.isPrivate,
        isUploadedByCurrentUser: true
      }));

      setDocumentsList(mappedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
      setDocumentsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scoutId) {
      fetchDocuments();
    }
  }, [scoutId, daftarId]);

  const filteredDocuments = documentsList.filter((doc) => {
    switch (activeTab) {
      case "private":
        return doc.isPrivate;
      case "received":
        return !doc.isPrivate && !doc.isUploadedByCurrentUser;
      case "sent":
        return !doc.isPrivate && doc.isUploadedByCurrentUser;
      default:
        return false;
    }
  });

  const privateCount = documentsList.filter(doc => doc.isPrivate).length;
  const receivedCount = documentsList.filter(doc => !doc.isPrivate && !doc.isUploadedByCurrentUser).length;
  const sentCount = documentsList.filter(doc => !doc.isPrivate && doc.isUploadedByCurrentUser).length;

  console.log('Counts:', { privateCount, receivedCount, sentCount });
  console.log('Active Tab:', activeTab);

  const addActivityLog = (newActivity: Omit<ActivityLog, "id">) => {
    const activity: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      ...newActivity,
    };
    setRecentActivity((prev) => [activity, ...(prev || [])]);
  };

  const handleUpload = async () => {
    // Disable uploads for specific pitch ID
    if (pitchId === "HJqVubjnQ3RVGzlyDUCY4") {
      toast({
        title: "Upload Disabled",
        description: "The document is execlusive to the daftar investors",
        variant: "destructive",
      });
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.xlsx";
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      try {
        setIsUploading(true);
        for (const file of Array.from(files)) {
          try {
            const url = await uploadInvestorPitchDocument(file, scoutId);

            if (!url) {
              throw new Error("Failed to get upload URL");
            }

            const response = await fetch("/api/endpoints/scouts/documents", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                size: file.size,
                docType: file.type || file.name.split(".").pop() || "unknown",
                docName: file.name,
                scoutId,
                daftarId,
                url: url,
                isPrivate: activeTab === "private"
              }),
              credentials: "include",
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Failed to create document record");
            }

            toast({
              title: "Success",
              description: `Successfully uploaded ${file.name}`,
            });
          } catch (fileError: any) {
            console.error(`Error uploading ${file.name}:`, fileError);
            toast({
              title: "Error",
              description: `Failed to upload ${file.name}: ${fileError.message}`,
              variant: "destructive",
            });
          }
        }
      } finally {
        setIsUploading(false);
        fetchDocuments();
      }
    };

    input.click();
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.url) {
      toast({
        title: "Error",
        description: "Document URL not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extract the key from the S3 URL
      const urlParts = doc.url.split('.amazonaws.com/');
      if (urlParts.length !== 2) {
        throw new Error("Invalid document URL format");
      }
      const key = urlParts[1];

      // Get the S3 URL
      const url = await getVideoUrl(key);

      window.open(url, "_blank");
      toast({
        title: "Downloading file",
        description: `Started downloading ${doc.name}`,
      });
      addActivityLog({
        action: "Downloaded",
        documentName: doc.name,
        user: "Current User",
        timestamp: formatDate(new Date().toISOString()),
      });
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: `Failed to download document: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleView = async (doc: Document) => {
    if (!doc.url) {
      toast({
        title: "Error",
        description: "Document URL not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extract the key from the S3 URL
      const urlParts = doc.url.split('.amazonaws.com/');
      if (urlParts.length !== 2) {
        throw new Error("Invalid document URL format");
      }
      const key = urlParts[1];

      // Get the S3 URL
      const url = await getVideoUrl(key);

      window.open(url, "_blank");
      toast({
        title: "Opening document",
        description: `Opening ${doc.name} for viewing`,
      });
      addActivityLog({
        action: "Viewed",
        documentName: doc.name,
        user: "Current User",
        timestamp: formatDate(new Date().toISOString()),
      });
    } catch (error: any) {
      console.error("Error viewing document:", error);
      toast({
        title: "Error",
        description: `Failed to view document: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const response = await fetch(`/api/endpoints/scouts/documents?docId=${docId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      // Remove document from local state
      setDocumentsList((prev) => prev.filter((doc) => doc.id !== docId));

      toast({
        title: "Success",
        description: "Document deleted successfully",
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

  const handleToggleVisibility = (docId: string) => {
    setDocumentsList((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const newVisibility = !doc.isHidden;
          addActivityLog({
            action: newVisibility ? "Hidden" : "Unhidden",
            documentName: doc.name,
            user: "Current User",
            timestamp: formatDate(new Date().toISOString()),
          });
          toast({
            title: newVisibility ? "Document hidden" : "Document visible",
            description: `${doc.name} is now ${newVisibility ? "hidden" : "visible"
              }`,
          });
          return { ...doc, isHidden: newVisibility };
        }
        return doc;
      })
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex px-5 mt-10 gap-6">
        <Card className="border-none bg-[#0e0e0e] flex-1">
          <CardContent className="space-y-6">
            <Tabs
              defaultValue="private"
              onValueChange={(value: string) => {
                setActiveTab(value as typeof activeTab);
                setIsPrivate(value === "private");
              }}
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
                  onClick={handleUpload}
                  disabled={isUploading || pitchId === "HJqVubjnQ3RVGzlyDUCY4"}
                  className="rounded-[0.35rem]"
                >
                  {isUploading ? (
                    "Uploading..."
                  ) : pitchId === "HJqVubjnQ3RVGzlyDUCY4" ? (
                    "Upload Disabled"
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Loading documents...
                </div>
              ) : (
                <>
                  <TabsContent value="private" className="space-y-4">
                    <DocumentsList
                      documents={filteredDocuments}
                      canDelete={true}
                      onDownload={handleDownload}
                      onView={handleView}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      emptyMessage={emptyStateMessages.private}
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
                      emptyMessage={emptyStateMessages.received}
                    />
                  </TabsContent>

                  <TabsContent value="sent" className="space-y-4">
                    <DocumentsList
                      documents={filteredDocuments}
                      canDelete={true}
                      onDownload={handleDownload}
                      onView={handleView}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      emptyMessage={emptyStateMessages.sent}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
  documents?: Document[];
  canDelete?: boolean;
  onDownload: (doc: Document) => void;
  onView: (doc: Document) => void;
  onDelete: (docId: string) => void;
  onToggleVisibility: (docId: string) => void;
  emptyMessage?: string;
}) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        {emptyMessage || "No documents found"}
      </div>
    );
  }

  const renderMetadata = (doc: Document) => {
    const visibilityText = {
      "investors_only": "Visible to all investors",
      "private": "Visible to daftar investors only"
    };

    return (
      <>
        <div className="flex flex-col gap-1">
          <div>
            <span className="text-muted-foreground">Uploaded by:</span>{" "}
            {doc.uploadedBy?.name || "Unknown"}
          </div>
          <div>
            <span className="text-muted-foreground">From:</span>{" "}
            {doc.daftar.name}
          </div>
          <div>
            <span className="text-muted-foreground">Uploaded at:</span>{" "}
            {doc.uploadedAt}
          </div>
          <div className="text-xs mt-2">
            <span className={`px-2 py-1 rounded ${
              doc.visibility === "investors_only" ? "bg-blue-900/50" : "bg-red-900/50"
            }`}>
              {visibilityText[doc.visibility as keyof typeof visibilityText]}
            </span>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        console.log(doc);
        return (
        <div
          key={doc.id}
          className={`bg-[#1a1a1a] p-6 rounded-[0.35rem] ${doc.isHidden ? "opacity-50" : ""
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
      )})}
    </div>
  );
}