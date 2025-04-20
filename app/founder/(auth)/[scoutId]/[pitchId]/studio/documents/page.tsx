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
import { uploadFounderPitchDocument } from "@/lib/actions/document";

interface Document {
  id: string;
  name: string;
  uploadedBy: string;
  daftar: string;
  scoutName: string;
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
  const [activeTab, setActiveTab] = useState<"private" | "received" | "sent">("received");

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(
          `/api/endpoints/pitch/founder/documents?scoutId=${scoutId}&pitchId=${pitchId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const { sent, received } = await response.json();

        // Map sent documents
        const sentDocs: Document[] = sent.map((doc: any) => ({
          id: doc.id,
          name: doc.docType,
          uploadedBy: doc.uploadedBy || "N/A",
          daftar: "Unknown",
          scoutName: "Unknown",
          uploadedAt: formatDate(doc.uploadedAt || new Date().toISOString()),
          type: "sent",
          size: "Unknown",
          isHidden: doc.isPrivate || false,
          logs: [
            {
              action: "Uploaded",
              timestamp: formatDate(doc.uploadedAt || new Date().toISOString()),
              user: doc.uploadedBy || "N/A",
            },
          ],
        }));

        // Map received documents
        const receivedDocs: Document[] = received.map((doc: any) => ({
          id: doc.id,
          name: doc.docType,
          uploadedBy: doc.uploadedBy || "N/A",
          daftar: "Unknown",
          scoutName: "Unknown",
          uploadedAt: formatDate(doc.uploadedAt || new Date().toISOString()),
          type: "received",
          size: "Unknown",
          isHidden: doc.isPrivate || false,
        }));

        // Map private documents (assuming private documents are those marked isPrivate)
        const privateDocs: Document[] = [...sent, ...received]
          .filter((doc: any) => doc.isPrivate)
          .map((doc: any) => ({
            id: doc.id,
            name: doc.docType,
            uploadedBy: doc.uploadedBy || "N/A",
            daftar: "Unknown",
            scoutName: "Unknown",
            uploadedAt: formatDate(doc.uploadedAt || new Date().toISOString()),
            type: "private",
            size: "Unknown",
            isHidden: true,
            logs: doc.type === "sent" ? [
              {
                action: "Uploaded",
                timestamp: formatDate(doc.uploadedAt || new Date().toISOString()),
                user: doc.uploadedBy || "N/A",
              },
            ] : [],
          }));

        setDocumentsList([...sentDocs, ...receivedDocs, ...privateDocs]);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive",
        });
      }
    };

    if (scoutId && pitchId) {
      fetchDocuments();
    }
  }, [scoutId, pitchId, toast]);

  const handleUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.xlsx";
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        try {
          const newDocs: Document[] = [];
          for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append("file", file);

            const docUrl = await uploadFounderPitchDocument(
              file,
              pitchId,
              scoutId
            );
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
                  isPrivate: activeTab === "private",
                }),
              }
            );

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Failed to upload document");
            }

            const insertedDoc = await response.json();
            newDocs.push({
              id: insertedDoc.id,
              name: insertedDoc.docName,
              uploadedBy: insertedDoc.uploadedBy || "N/A",
              daftar: "Unknown",
              scoutName: "Unknown",
              uploadedAt: formatDate(
                insertedDoc.uploadedAt || new Date().toISOString()
              ),
              type: activeTab === "private" ? "private" : "sent",
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              isHidden: insertedDoc.isPrivate || false,
              logs: [
                {
                  action: "Uploaded",
                  timestamp: formatDate(
                    insertedDoc.uploadedAt || new Date().toISOString()
                  ),
                  user: insertedDoc.uploadedBy || "N/A",
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
        }
      }
    };

    input.click();
  };

  const handleDownload = (doc: Document) => {
    toast({
      title: "Downloading file",
      description: `Started downloading ${doc.name}`,
    });
    window.open(`https://example.com/uploads/${doc.name}`, "_blank");
  };

  const handleView = (doc: Document) => {
    toast({
      title: "Opening document",
      description: `Opening ${doc.name} for viewing`,
    });
    window.open(`https://example.com/uploads/${doc.name}`, "_blank");
  };

  const handleDelete = async (docId: string) => {
    try {
      const response = await fetch(`/api/endpoints/pitch/delete/${docId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      const doc = documentsList.find((d) => d.id === docId);
      if (doc) {
        setDocumentsList((prev) => prev.filter((d) => d.id !== docId));
        toast({
          title: "Document deleted",
          description: `Successfully deleted ${doc.name}`,
        });
      }
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
              description: `${d.name} is now ${
                newVisibility ? "hidden" : "visible"
              }`,
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

  const filteredDocuments = documentsList.filter(
    (doc) => doc.type === activeTab
  );

  return (
    <div className="flex px-5 mt-10 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          <Tabs
            defaultValue="received"
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          >
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger
                  value="private"
                  className="flex items-center gap-2"
                >
                  Private
                </TabsTrigger>
                <TabsTrigger
                  value="received"
                  className="flex items-center gap-2"
                >
                  Received
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center gap-2">
                  Sent
                </TabsTrigger>
              </TabsList>
              <Button variant="outline" onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>

            <TabsContent value="private">
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

            <TabsContent value="received">
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

            <TabsContent value="sent">
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
      {documents.map((doc) => {
        return (
          <div
            key={doc.name}
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
              <div>Uploaded by: {doc.uploadedBy || "N/A"}</div>
              <div>Uploaded at: {doc.uploadedAt || "N/A"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}