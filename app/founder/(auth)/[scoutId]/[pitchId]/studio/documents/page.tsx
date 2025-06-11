"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Upload, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import formatDate from "@/lib/formatDate";
import { useToast } from "@/hooks/use-toast";
import { uploadVideoToS3, getVideoUrl, deleteVideoFromS3 } from "@/lib/s3";

interface Document {
  id: string;
  name: string;
  uploadedBy: string;
  daftar: string;
  scoutName: string;
  uploadedAt: string;
  type: "private" | "received" | "sent";
  size: string;
  docUrl: string;
  logs?: {
    action: string;
    timestamp: string;
    user: string;
  }[];
  isHidden?: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  documentName: string;
  user: string;
  timestamp: string;
}

const emptyStateMessages: Record<string, string> = {
  private: "No file uploaded. Documents will only be visible to your team.",
  received: "The Received folder is empty for now.",
  sent: "The Sent folder is empty for now.",
};

export default function DocumentsPage() {
  const pathname = usePathname();
  const pitchId = pathname.split("/")[3];
  const scoutId = pathname.split("/")[2];
  const { toast } = useToast();
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">("received");

  const privateCount = documentsList.filter((doc) => doc.type === "private").length;
  const receivedCount = documentsList.filter((doc) => doc.type === "received").length;
  const sentCount = documentsList.filter((doc) => doc.type === "sent").length;

  // Function to fetch user info
  const fetchUserInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/endpoints/users/info?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  };

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/endpoints/pitch/founder/documents?scoutId=${scoutId}&pitchId=${pitchId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const { sent, received } = await response.json();

        // Map sent documents
        const sentDocs = await Promise.all(sent.map(async (doc: any) => {
          const userInfo = await fetchUserInfo(doc.uploadedBy);
          return {
            id: doc.id,
            name: doc.docName,
            docUrl: doc.docUrl || "",
            uploadedBy: userInfo ? userInfo.name : "N/A",
            daftar: "Unknown",
            scoutName: "Unknown",
            uploadedAt: formatDate(doc.uploadedAt || new Date().toISOString()),
            type: "sent",
            size: doc.size.toString(),
            isHidden: doc.isPrivate || false,
            logs: [
              {
                action: "Uploaded",
                timestamp: formatDate(doc.uploadedAt || new Date().toISOString()),
                user: userInfo ? userInfo.name : "N/A",
              },
            ],
          };
        }));

        // Map received documents
        const receivedDocs = await Promise.all(received.map(async (doc: any) => {
          const userInfo = await fetchUserInfo(doc.uploadedBy);
          // Skip if private and uploaded by investor
          if (doc.isPrivate && userInfo?.role === "investor") {
            return null;
          }
          return {
            id: doc.id,
            name: doc.docName,
            docUrl: doc.docUrl || "",
            uploadedBy: userInfo ? userInfo.name : "N/A",
            daftar: "Unknown",
            scoutName: "Unknown",
            uploadedAt: formatDate(doc.uploadedAt || new Date().toISOString()),
            type: "received",
            size: doc.size.toString(),
            isHidden: doc.isPrivate || false,
          };
        }));

        // Filter out null values (skipped documents)
        const filteredReceivedDocs = receivedDocs.filter(doc => doc !== null);

        setDocumentsList([...sentDocs, ...filteredReceivedDocs]);
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

    if (scoutId && pitchId) {
      fetchDocuments();
    }
  }, [scoutId, pitchId, toast]);

  const handleUpload = async () => {
    // Disable uploads for specific pitch ID
    if (pitchId === "HJqVubjnQ3RVGzlyDUCY4") {
      toast({
        title: "Upload Disabled",
        description: "The document is execlusively to your daftar investors",
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
      if (files && files.length > 0) {
        try {
          setIsUploading(true);
          const newDocs: Document[] = [];
          for (const file of Array.from(files)) {
            // Generate a unique key for S3
            const key = `founder-docs/${pitchId}/${Date.now()}-${file.name}`;

            // Upload to S3
            const docUrl = await uploadVideoToS3(file, key);

            // Create document record
            const response = await fetch(
              "/api/endpoints/pitch/founder/documents",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  pitchId,
                  docName: file.name,
                  docType: file.type || file.name.split(".").pop(),
                  docUrl,
                  size: file.size,
                  isPrivate: activeTab === "private",
                }),
              }
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Failed to upload document");
            }

            const [insertedDoc] = await response.json();
            const userInfo = await fetchUserInfo(insertedDoc.uploadedBy);

            newDocs.push({
              id: insertedDoc.id,
              name: insertedDoc.docName,
              docUrl: insertedDoc.docUrl || "",
              uploadedBy: userInfo ? userInfo.name : "N/A",
              daftar: "Unknown",
              scoutName: "Unknown",
              uploadedAt: formatDate(
                insertedDoc.uploadedAt || new Date().toISOString()
              ),
              type: activeTab === "private" ? "private" : "sent",
              size: insertedDoc.size.toString(),
              isHidden: insertedDoc.isPrivate || false,
              logs: [
                {
                  action: "Uploaded",
                  timestamp: formatDate(
                    insertedDoc.uploadedAt || new Date().toISOString()
                  ),
                  user: userInfo ? userInfo.name : "N/A",
                },
              ],
            });
          }

          setDocumentsList((prev) => [...newDocs, ...prev]);
          toast({
            title: "Upload successful",
            description: `${files.length} file(s) uploaded to ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
          });
        } catch (error: any) {
          console.error("Error uploading documents:", error);
          toast({
            title: "Error",
            description: `Failed to upload document: ${error.message}`,
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      }
    };

    input.click();
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.docUrl) {
      toast({
        title: "Error",
        description: "Document URL not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extract the key from the S3 URL
      const urlParts = doc.docUrl.split('.amazonaws.com/');
      if (urlParts.length !== 2) {
        throw new Error("Invalid document URL format");
      }
      const key = urlParts[1];

      // Get the S3 URL
      const url = await getVideoUrl(key);

      toast({
        title: "Downloading file",
        description: `Started downloading ${doc.name}`,
      });
      window.open(url, "_blank");
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
    if (!doc.docUrl) {
      toast({
        title: "Error",
        description: "Document URL not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extract the key from the S3 URL
      const urlParts = doc.docUrl.split('.amazonaws.com/');
      if (urlParts.length !== 2) {
        throw new Error("Invalid document URL format");
      }
      const key = urlParts[1];

      // Get the S3 URL
      const url = await getVideoUrl(key);

      toast({
        title: "Opening document",
        description: `Opening ${doc.name} for viewing`,
      });
      window.open(url, "_blank");
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
      const doc = documentsList.find((d) => d.id === docId);
      if (!doc) return;

      // First confirm with the user
      if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
        return;
      }

      // Delete document using the new endpoint
      const response = await fetch(
        `/api/endpoints/pitch/documents/delete?id=${docId}&pitchId=${pitchId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete document");
      }

      // Remove from local state
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

      const response = await fetch(
        `/api/endpoints/pitch/founder/documents/${docId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPrivate: !doc.isHidden }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to toggle visibility");
      }

      setDocumentsList((prev) =>
        prev.map((d) => {
          if (d.id === docId) {
            const newVisibility = !d.isHidden;
            toast({
              title: newVisibility ? "Document hidden" : "Document visible",
              description: `${d.name} is now ${newVisibility ? "hidden" : "visible"
                }`,
            });
            return {
              ...d,
              isHidden: newVisibility,
              type: newVisibility ? "private" : d.type,
            };
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
    <div className="flex px-5 mt-10 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          <Tabs
            defaultValue="received"
            onValueChange={(value: string) =>
              setActiveTab(value as typeof activeTab)
            }
          >
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="private" className="flex items-center gap-2">
                  Private <span className="ml-1 text-xs text-muted-foreground">{privateCount}</span>
                </TabsTrigger>
                <TabsTrigger value="received" className="flex items-center gap-2">
                  Received <span className="ml-1 text-xs text-muted-foreground">{receivedCount}</span>
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center gap-2">
                  Sent <span className="ml-1 text-xs text-muted-foreground">{sentCount}</span>
                </TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                onClick={handleUpload}
                disabled={isUploading || pitchId === "HJqVubjnQ3RVGzlyDUCY4"}
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Uploading...
                  </>
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
              <div className="flex justify-center items-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <>
                <TabsContent value="private">
                  <DocumentsList
                    documents={documentsList.filter((doc) => doc.isHidden)}
                    canDelete={true}
                    onDownload={handleDownload}
                    onView={handleView}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                    emptyMessage={emptyStateMessages.private}
                  />
                </TabsContent>

                <TabsContent value="received">
                  <DocumentsList
                    documents={documentsList.filter((doc) => doc.type === "received" && !doc.isHidden)}
                    canDelete={false}
                    onDownload={handleDownload}
                    onView={handleView}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                    emptyMessage={emptyStateMessages.received}
                  />
                </TabsContent>

                <TabsContent value="sent">
                  <DocumentsList
                    documents={documentsList.filter((doc) => doc.type === "sent" && !doc.isHidden)}
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
  );
}

function getNullishFields(doc: Document): string[] {
  const nullishFields: string[] = [];

  Object.entries(doc).forEach(([key, value]) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    ) {
      nullishFields.push(key);
    }
  });

  return nullishFields;
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
  const pathname = usePathname();
  const pitchId = pathname.split("/")[3];

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => {
        return (
          <div
            key={doc.id + index}
            className={`bg-[#1a1a1a] p-6 rounded-[0.35rem] ${doc.isHidden ? "opacity-50" : ""
              }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8" />
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)}
                    </p>
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
                    disabled={pitchId === 'HJqVubjnQ3RVGzlyDUCY4'}
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
              <div>Uploaded at: {doc.uploadedAt}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
