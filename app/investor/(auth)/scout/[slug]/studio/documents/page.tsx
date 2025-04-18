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

interface Document {
  id: string;
  name: string;
  uploadedBy: string;
  daftar: string;
  scoutName: string;
  url?: string;
  uploadedAt: string;
  type: "private" | "received" | "sent";
  size: string;
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

interface ApiDocument {
  docId: string;
  docType: string;
  docUrl: string;
  size: number;
  isPrivate: boolean;
  uploadedAt: string;
  uploadedBy: { id: string; firstName: string; lastName: string } | null;
  daftarName: string | null;
}

export default function DocumentsPage() {
  const { toast } = useToast();
  const daftarId = useDaftar().selectedDaftar;
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">(
    "private"
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Fetch documents from /api/scout-documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(
          `/api/endpoints/scouts/documents?scoutId=${scoutId}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const apiDocuments = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];

        if (apiDocuments.length === 0) {
          toast({
            title: "No documents found",
            description: "No documents available for this scout",
          });
          return;
        }

        const mappedDocuments: Document[] = apiDocuments.map(
          (doc: Document) => {
            let sizeInMB = "Unknown Size";

            if (typeof doc.size === "number") {
              sizeInMB = `${(doc.size / (1024 * 1024)).toFixed(1)} MB`;
            } else if (typeof doc.size === "string") {
              const parsed = parseFloat(doc.size.split(" ")[0]);
              if (!isNaN(parsed)) {
                sizeInMB = `${(parsed / (1024 * 1024)).toFixed(1)} MB`;
              }
            }

            return {
              id: doc.id,
              name: doc.type || doc.url?.split("/").pop() || "Unknown Document",
              uploadedBy: doc.uploadedBy
                ? `${doc.uploadedBy}`.trim()
                : "Unknown User",
              daftar: doc.daftar || "Unknown Daftar",
              scoutName: "Scout",
              uploadedAt: formatDate(doc.uploadedAt),
              url: doc.url,
              type: doc.isHidden ? "private" : "sent",
              size: sizeInMB,
              isHidden: false,
              logs: [],
            };
          }
        );

        setDocumentsList(mappedDocuments);
      } catch (err) {
        console.error("Error fetching documents:", err);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      }
    };

    if (scoutId) {
      fetchDocuments();
    }
  }, [scoutId, toast]);

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
    setRecentActivity((prev) => [activity, ...(prev || [])]);
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
      for (const file of Array.from(selectedFiles)) {
        console.log("Uploading file:", file, selectedFiles);

        // Simulate file upload and get a URL (mocking Supabase Storage)
        const url = await uploadInvestorPitchDocument(file, scoutId); // Upload to Supabase Storage
        console.log(url);

        // Save document metadata via POST /api/scout-documents
        const response = await fetch("/api/endpoints/scouts/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            size: file.size,
            docType: file.name,
            scoutId,
            daftarId,
            url,
            isPrivate: type === "private",
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9), // Temporary ID
          name: file.name,
          uploadedBy: "Current User", // Replace with actual user name from session
          daftar: "Unknown Daftar", // Updated on next fetch
          scoutName: "Scout",
          uploadedAt: formatDate(new Date().toISOString()),
          type,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          isHidden: false,
          logs: [
            {
              action: "Uploaded",
              timestamp: formatDate(new Date().toISOString()),
              user: "Current User",
            },
          ],
        };

        setDocumentsList((prev) => [...prev, newDoc]);
        addActivityLog({
          action: "Uploaded",
          documentName: file.name,
          user: "Current User",
          timestamp: formatDate(new Date().toISOString()),
        });
        toast({
          title: "File uploaded",
          description: `Successfully uploaded ${file.name}`,
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: `Failed to upload ${selectedFiles[0]?.name || "document"}`,
        variant: "destructive",
      });
    }

    setIsUploadModalOpen(false);
    setSelectedFiles(null);
  };

  const handleDownload = (doc: Document) => {
    // Simulate download (use docUrl if stored)
    window.open(doc.url, "_blank"); // Placeholder, replace with docUrl
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
  };

  const handleView = (doc: Document) => {
    // Simulate view (use docUrl if stored)
    window.open(doc.url, "_blank"); // Placeholder, replace with docUrl
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
  };

  const handleDelete = (docId: string) => {
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
        user: "Current User",
        timestamp: formatDate(new Date().toISOString()),
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
    <div className="container mx-auto">
      <div className="flex px-5 mt-10 gap-6">
        <Card className="border-none bg-[#0e0e0e] flex-1">
          <CardContent className="space-y-6">
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
              <span className="text-xs text-muted-foreground">
                Only visible to your Daftar
              </span>
            </Button>

            <Button
              variant="outline"
              className="flex py-2 flex-col items-center justify-center h-24 space-y-1"
              onClick={() => handleUploadConfirm("sent")}
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
}: {
  documents?: Document[];
  canDelete?: boolean;
  onDownload: (doc: Document) => void;
  onView: (doc: Document) => void;
  onDelete: (docId: string) => void;
  onToggleVisibility: (docId: string) => void;
}) {
  if (!documents) {
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
            <span>From Scout: {doc.scoutName}</span>
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
      {documents.map((doc) => (
        <div
          key={doc.uploadedAt}
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
