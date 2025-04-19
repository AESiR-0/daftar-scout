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

export default function DocumentsPage() {
  const pathname = usePathname();
  const pitchId = pathname.split("/")[3];
  const scoutId = pathname.split("/")[2]; // Fixed typo: pathaname -> pathname
  const { toast } = useToast();
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

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
          daftar: "Unknown", // Not provided by API, placeholder
          scoutName: "Unknown", // Not provided by API, placeholder
          uploadedAt: formatDate(doc.uploadedAt || new Date().toISOString()),
          type: "sent",
          size: "Unknown", // Not provided by API, placeholder
          isHidden: doc.isPrivate || false,
          logs: [
            {
              action: "Uploaded",
              timestamp: formatDate(doc.uploadedAt || new Date().toISOString()),
              user: doc.uploadedBy || "N/A",
            },
          ],
        }));

        // Map received documents (scoutDocs and investorPitchDocs)
        const receivedDocs: Document[] = received.map((doc: any) => ({
          id: doc.id,
          name: doc.docType, // Handle scoutDocuments vs pitchDocs
          uploadedBy: doc.uploadedBy || "N/A",
          daftar: "Unknown", // Not provided by API, placeholder
          scoutName: "Unknown", // Not provided by API, placeholder
          uploadedAt: formatDate(doc.uploadedAt || new Date().toISOString()),
          type: "received",
          size: "Unknown", // Not provided by API, placeholder
          isHidden: doc.isPrivate || false,
        }));

        setDocumentsList([...sentDocs, ...receivedDocs]);
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

            // Simulate file upload to get docUrl (replace with actual file upload logic)
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
                  isPrivate: false,
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
              type: "sent",
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
            description: `${files.length} file(s) uploaded to Sent`,
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
    // Placeholder: Implement actual download logic
    window.open(`https://example.com/uploads/${doc.name}`, "_blank");
  };

  const handleView = (doc: Document) => {
    toast({
      title: "Opening document",
      description: `Opening ${doc.name} for viewing`,
    });
    // Placeholder: Implement actual view logic
    window.open(`https://example.com/uploads/${doc.name}`, "_blank");
  };

  const handleDelete = async (docId: string) => {
    try {
      // Placeholder: Implement actual DELETE endpoint
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
      // Placeholder: Implement actual PATCH endpoint to toggle isPrivate
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
        prev.map((doc) => {
          if (doc.id === docId) {
            const newVisibility = !doc.isHidden;
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

            <TabsContent value="received">
              <DocumentsList
                documents={filteredDocuments}
                canDelete={false}
                onDownload={handleDownload}
                onView={handleView}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
              />
            </TabsContent>

            <TabsContent value="sent">
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
