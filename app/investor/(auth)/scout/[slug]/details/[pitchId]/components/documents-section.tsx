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
import { getVideoUrl } from "@/lib/s3";

// Interface for the Document, aligned with API response
interface Document {
  id: string;
  name: string;
  docUrl: string;
  uploadedBy: string;
  uploaderRole: "investor" | "founder" | "unknown";
  daftar: {
    id: string;
    name: string;
  };
  uploadedAt: string;
  type: "private" | "received" | "sent";
  size: number;
  isHidden: boolean;
}

// Interface for Activity Log (local-only)
interface ActivityLog {
  id: string;
  action: string;
  documentName: string;
  user: string;
  timestamp: string;
}

interface APIDocument {
  id: string;
  pitchId: string;
  docName: string;
  docType: string;
  docUrl: string;
  size: number;
  isPrivate: boolean;
  uploadedBy: string;
  uploadedAt: string;
  isViewed?: boolean;
  // Additional fields for investor docs
  scoutId?: string;
  daftarId?: string;
}

interface UserInfo {
  name: string;
  role: string;
  daftarId: string | null;
  daftarName: string | null;
}

export default function DocumentsSection({
  pitchId,
  scoutId,
}: {
  pitchId: string;
  scoutId: string;
}) {
  const { toast } = useToast();
  const [documentsByType, setDocumentsByType] = useState<{
    private: Document[];
    received: Document[];
    sent: Document[];
  }>({
    private: [],
    received: [],
    sent: []
  });
  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">("private");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingUserIds, setLoadingUserIds] = useState<Set<string>>(new Set());

  // Optimized user info fetching with caching
  const userInfoCache = new Map<string, UserInfo>();
  const fetchUserInfo = async (userId: string | undefined): Promise<UserInfo> => {
    if (!userId) {
      return {
        name: "Unknown",
        role: "unknown",
        daftarId: null,
        daftarName: null
      };
    }

    // Check cache first
    const cachedInfo = userInfoCache.get(userId);
    if (cachedInfo) {
      return cachedInfo;
    }

    try {
      setLoadingUserIds(prev => new Set(prev).add(userId));

      // Fetch user info
      const userResponse = await fetch(`/api/endpoints/users/info?userId=${userId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }
      const userInfo = await userResponse.json();

      // If user is an investor, fetch their daftar info
      let daftarInfo = { daftarId: null, daftarName: null };
      if (userInfo.role === "investor") {
        const daftarResponse = await fetch(`/api/endpoints/daftar/by-user?userId=${userId}`);
        if (daftarResponse.ok) {
          daftarInfo = await daftarResponse.json();
        }
      }

      const info = {
        name: userInfo.name || "Unknown",
        role: userInfo.role || "unknown",
        daftarId: daftarInfo.daftarId,
        daftarName: daftarInfo.daftarName
      };

      // Cache the result
      userInfoCache.set(userId, info);
      return info;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return {
        name: "Unknown",
        role: "unknown",
        daftarId: null,
        daftarName: null
      };
    } finally {
      setLoadingUserIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  // Optimized document processing function
  const processDocument = (defaultType: "sent" | "received") => async (doc: any) => {
    try {
      if (!doc) return null;

      const userInfo = await fetchUserInfo(doc.uploadedBy);

      // Base document structure
      const baseDoc = {
        id: doc.id || String(Math.random()),
        name: doc.docName || doc.name || "Untitled Document",
        docUrl: doc.docUrl || "",
        uploadedBy: userInfo.name,
        uploaderRole: userInfo.role,
        uploadedAt: doc.uploadedAt ? formatDate(doc.uploadedAt) : formatDate(new Date().toISOString()),
        size: doc.size ? formatFileSize(doc.size) : "Unknown",
        isHidden: Boolean(doc.isPrivate),
      };

      // For received documents (from founders), don't include daftar info
      if (defaultType === "received") {
        return {
          ...baseDoc,
          type: "received",
          daftar: {
            id: "N/A",
            name: "N/A"
          }
        };
      }

      // For sent documents (from investors), include daftar info
      return {
        ...baseDoc,
        type: doc.isPrivate ? "private" : "sent",
        daftar: {
          id: userInfo.daftarId,
          name: userInfo.daftarName
        }
      };
    } catch (error) {
      console.error(`Error processing ${defaultType} document:`, error);
      return null;
    }
  };

  // Fetch all documents at once
  const fetchAllDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/endpoints/pitch/investor/documents?scoutId=${scoutId}&pitchId=${pitchId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const receivedDocs = await response.json();

      const processedDocs = await Promise.all(
        receivedDocs.map(async (doc: any) => {
          try {
            if (!doc) return null;

            const processedDoc: Document = {
              id: doc.id,
              name: doc.docName,
              docUrl: doc.docUrl,
              uploadedBy: doc.uploadedBy?.name || "Unknown",
              uploaderRole: "founder",
              daftar: {
                id: "N/A",
                name: "N/A"
              },
              uploadedAt: formatDate(doc.uploadedAt),
              type: "received",
              size: typeof doc.size === 'number' ? doc.size : 0,
              isHidden: Boolean(doc.isPrivate)
            };

            return processedDoc;
          } catch (error) {
            console.error("Error processing document:", error);
            return null;
          }
        })
      );

      // Filter and categorize documents
      const validDocs = {
        private: [] as Document[],
        sent: [] as Document[],
        received: [] as Document[]
      };

      processedDocs
        .filter((doc): doc is Document => doc !== null)
        .forEach(doc => {
          validDocs.received.push(doc);
        });

      setDocumentsByType(validDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch documents",
        variant: "destructive",
      });
      setDocumentsByType({ private: [], received: [], sent: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch documents only on mount
  useEffect(() => {
    fetchAllDocuments();
  }, [pitchId]); // Only re-fetch if pitchId changes

  const handleUpload = async () => {
    // Disable uploads for specific pitch ID
    if (pitchId === "HJqVubjnQ3RVGzlyDUCY4") {
      toast({
        title: "Upload Disabled",
        description: "Uploads are not allowed for this pitch",
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
      if (!files?.length) return;

      try {
        setIsUploading(true);
        await Promise.all(Array.from(files).map(async (file) => {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("scoutId", scoutId);
            formData.append("pitchId", pitchId);
            formData.append("isPrivate", String(activeTab === "private"));

            const response = await fetch("/api/endpoints/pitch/investor/documents/upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || "Failed to upload document");
            }

            toast({
              title: "Success",
              description: `Successfully uploaded ${file.name}`,
            });

            // Refresh the document list
            await fetchAllDocuments();
          } catch (error: any) {
            console.error("Error uploading document:", error);
            toast({
              title: "Error",
              description: `Failed to upload ${file.name}: ${error.message}`,
              variant: "destructive",
            });
          }
        }));
      } finally {
        setIsUploading(false);
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

      window.open(url, "_blank");
      toast({
        title: "Downloading file",
        description: `Started downloading ${doc.name}`,
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

      window.open(url, "_blank");
      toast({
        title: "Opening document",
        description: `Opening ${doc.name} for viewing`,
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
      const doc = documentsByType[activeTab].find((d) => d.id === docId);
      if (!doc) return;

      if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
        return;
      }

      const response = await fetch(`/api/endpoints/pitch/investor/documents?docId=${docId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete document");
      }

      // Update the appropriate document list
      setDocumentsByType(prev => {
        const type = doc.type;
        return {
          ...prev,
          [type]: prev[type].filter(d => d.id !== docId)
        };
      });

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
      const doc = documentsByType[activeTab].find((d) => d.id === docId);
      if (!doc) return;

      const response = await fetch(`/api/endpoints/pitch/investor/document?docId=${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: !doc.isHidden }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle visibility");
      }

      // Update document visibility in state
      setDocumentsByType(prev => {
        const newVisibility = !doc.isHidden;
        const oldType = doc.type;
        const newType = newVisibility ? "private" : "sent";

        // Remove from old list
        const updatedOldList = prev[oldType].filter(d => d.id !== docId);

        // Add to new list with updated properties
        const updatedDoc = {
          ...doc,
          isHidden: newVisibility,
          type: newType
        };

        return {
          ...prev,
          [oldType]: updatedOldList,
          [newType]: [updatedDoc, ...prev[newType]]
        };
      });

      toast({
        title: doc.isHidden ? "Document visible" : "Document hidden",
        description: `${doc.name} is now ${doc.isHidden ? "visible" : "hidden"}`,
      });
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
            defaultValue="private"
            onValueChange={(value: string) => setActiveTab(value as typeof activeTab)}
          >
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="private" className="flex items-center gap-2">
                  Private
                  <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                    {documentsByType.private.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="received" className="flex items-center gap-2">
                  Received
                  <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                    {documentsByType.received.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center gap-2">
                  Sent
                  <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                    {documentsByType.sent.length}
                  </span>
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
                    Upload {activeTab === "private" ? "(Private)" : "(Public)"}
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
                    documents={documentsByType.private}
                    canDelete={true}
                    onDownload={handleDownload}
                    onView={handleView}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                    emptyMessage="No private documents uploaded yet. These will be visible to scout members only."
                    loadingUserIds={loadingUserIds}
                  />
                </TabsContent>

                <TabsContent value="received">
                  <DocumentsList
                    documents={documentsByType.received}
                    canDelete={false}
                    onDownload={handleDownload}
                    onView={handleView}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                    emptyMessage="No documents received from founders yet"
                    loadingUserIds={loadingUserIds}
                  />
                </TabsContent>

                <TabsContent value="sent">
                  <DocumentsList
                    documents={documentsByType.sent}
                    canDelete={true}
                    onDownload={handleDownload}
                    onView={handleView}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                    emptyMessage="No documents sent to founders yet"
                    loadingUserIds={loadingUserIds}
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
function formatFileSize(sizeInBytes: number): string {
  // Handle invalid input
  if (typeof sizeInBytes !== 'number' || isNaN(sizeInBytes)) {
    return "Unknown";
  }

  if (sizeInBytes === 0) return "0 Mb";

  // Convert bytes to bits (1 byte = 8 bits) and then to Megabits
  const Mb = (sizeInBytes * 8) / (1024 * 1024);

  // If less than 0.01 Mb, show as "< 0.01 Mb"
  if (Mb < 0.01) {
    return "< 0.01 Mb";
  }

  // Format to 2 decimal places, but remove trailing zeros
  const formattedSize = Mb.toFixed(2).replace(/\.?0+$/, '');

  return `${formattedSize} Mb`;
}

function DocumentsList({
  documents,
  canDelete = false,
  onDownload,
  onView,
  onDelete,
  onToggleVisibility,
  emptyMessage,
  loadingUserIds,
}: {
  documents: Document[];
  canDelete?: boolean;
  onDownload: (doc: Document) => void;
  onView: (doc: Document) => void;
  onDelete: (docId: string) => void;
  onToggleVisibility: (docId: string) => void;
  emptyMessage: string;
  loadingUserIds: Set<string>;
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
      {documents.map((doc, index) => {
        const isLoadingUserInfo = loadingUserIds.has(doc.uploadedBy);
        return (
          <div
            key={doc.id + index}
            className={`bg-[#1a1a1a] p-6 rounded-[0.35rem] ${doc.isHidden ? "opacity-50" : ""} ${isLoadingUserInfo ? "animate-pulse" : ""}`}
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
                  disabled={isLoadingUserInfo}
                >
                  <Download className="h-4 w-4" />
                </Button>

                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted/50"
                    onClick={() => onDelete(doc.id)}
                    disabled={isLoadingUserInfo}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <div>
                {isLoadingUserInfo ? (
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                ) : (
                  <>Uploaded by: {doc.uploadedBy}</>
                )}
              </div>
              {doc.daftar.name !== "N/A" && (
                <div>
                  {isLoadingUserInfo ? (
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                  ) : (
                    <>Daftar: {doc.daftar.name}</>
                  )}
                </div>
              )}
              <div>Uploaded at: {doc.uploadedAt}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
