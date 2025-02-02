"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Upload, Trash2, Router } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/dialogs/report-dialog";
import { ScheduleMeetingDialog } from "@/components/dialogs/schedule-meeting-dialog";
import ReportPage from "./report/page";

// Import ApexCharts with NoSSR
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
});

/** ------------- Types -------------- **/
interface Document {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface FoundersPitch {
  status: string;
  location: string;
  sectors: string[];
}

interface Analysis {
  performanceData: number[];
  investmentDistribution: number[];
}

interface PitchDetails {
  daftarName: string;
  pitchName: string;
  status: string;
  sections: {
    investorsNote: string;
    documentation: Document[];
    foundersPitch: FoundersPitch;
    analysis: Analysis;
  };
}

/** ------------- Chart Config -------------- **/
const chartConfig: any = {
  options: {
    chart: {
      type: "area" as any,
      background: "transparent",
      toolbar: { show: false }
    },
    stroke: {
      curve: "smooth" as any,
      width: 2
    },
    fill: {
      type: "gradient" as any,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    colors: ["#2563eb"],
    theme: { mode: "dark" },
    grid: { borderColor: "#334155" },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May"],
      labels: { style: { colors: "#94a3b8" } }
    },
    yaxis: {
      labels: { style: { colors: "#94a3b8" } }
    }
  }
};

const sections = [
  { id: "investors-note", label: "Investor's Note" },
  { id: "documents", label: "Documents" },
  { id: "founders-pitch", label: "Founder's Pitch" },
  { id: "analysis", label: "Analysis" }
];

/** ------------- Components -------------- **/
function InvestorsNote({ note }: { note: string }) {
  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader>
        <CardTitle>Investor's Note</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function DocumentsSection({ documents }: { documents: Document[] }) {
  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <Button variant="outline" size="icon">
          <Upload className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-[#1f1f1f] rounded-lg hover:border hover:border-blue-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded by {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FoundersPitchSection({
  pitch,
  onScheduleMeeting
}: {
  pitch: FoundersPitch;
  onScheduleMeeting: () => void;
}) {
  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Founder's Pitch</CardTitle>
          <Button onClick={onScheduleMeeting} variant="outline">
            Schedule Meeting
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="">
          <video src="https://example.com/video" controls className="w-full rounded-lg"></video>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#1f1f1f] rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <Badge variant="secondary">{pitch.status}</Badge>
          </div>
          <div className="p-4 bg-[#1f1f1f] rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Location</p>
            <p className="text-sm">{pitch.location}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {pitch.sectors.map((sector) => (
            <Badge key={sector} variant="outline">{sector}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalysisSection({ analysis }: { analysis: Analysis }) {
  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analysis</CardTitle>
          <Button variant="outline" onClick={() => window.location.href = `${window.location.href}/report`}>
            <Router className="h-4 w-4 mr-2" />
            Go to Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="bg-[#1f1f1f] p-6 rounded-lg">
            <h3 className="text-sm font-medium mb-4">Performance Metrics</h3>
            {typeof window !== 'undefined' && (
              <Chart
                options={{
                  colors: ['#2563eb'],
                  xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    labels: {
                      style: {
                        colors: '#71717a'
                      }
                    }
                  },
                  yaxis: {
                    labels: {
                      style: {
                        colors: '#71717a'
                      }
                    }
                  },
                  grid: {
                    borderColor: '#27272a'
                  },
                  tooltip: {
                    theme: 'dark'
                  }
                }}
                series={[
                  {
                    name: 'Performance',
                    data: [30, 40, 35, 50, 49]
                  }
                ]}
                type="area"
                height={300}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** ------------- Main Component -------------- **/
export default function PitchDetailsPage() {
  const [activeSection, setActiveSection] = useState("investors-note");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);

  // Sample data - replace with API call
  const pitchDetails: PitchDetails = {
    daftarName: "Tech Startup",
    pitchName: "AI Chatbot",
    status: "In Review",
    sections: {
      investorsNote: "This is a promising startup with great potential...",
      documentation: [
        { id: "1", name: "Financial_Model.xlsx", uploadedBy: "John Doe", uploadedAt: "2024-03-20" },
        { id: "2", name: "Pitch_Deck.pdf", uploadedBy: "Sarah Smith", uploadedAt: "2024-03-19" },
      ],
      foundersPitch: {
        status: "Under Review",
        location: "Dubai, UAE",
        sectors: ["AI/ML", "SaaS"]
      },
      analysis: {
        performanceData: [30, 40, 35, 50, 49],
        investmentDistribution: [44, 55, 41, 17]
      }
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-6rem)]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-border py-5">
          <div className="flex gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                className={cn(
                  "text-sm font-medium",
                  activeSection === section.id && "bg-[#1f1f1f]"
                )}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeSection === "investors-note" && (
            <InvestorsNote note={pitchDetails.sections.investorsNote} />
          )}
          {activeSection === "documents" && (
            <DocumentsSection documents={pitchDetails.sections.documentation} />
          )}
          {activeSection === "founders-pitch" && (
            <FoundersPitchSection
              pitch={pitchDetails.sections.foundersPitch}
              onScheduleMeeting={() => setScheduleMeetingOpen(true)}
            />
          )}
          {activeSection === "analysis" && (
            <AnalysisSection analysis={pitchDetails.sections.analysis} />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />
      <ScheduleMeetingDialog
        open={scheduleMeetingOpen}
        onOpenChange={setScheduleMeetingOpen}
      />
    </ScrollArea>
  );
}
