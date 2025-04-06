import { ScoutSidebar } from "@/components/navbar/scout-sidebar";

interface ScoutStatus {
  isPlanning: boolean;
  isScheduling: boolean;
  scheduledDate?: string;
}


async function getInvestorPitchData({
  scoutId,
  pitchId,
}: {
  scoutId: string;
  pitchId: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/investor-pitch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scoutId, pitchId }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch investor pitch data");
    return null;
  }

  const json = await res.json();
  return json.data;
}

export default async function ScoutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const status = getScoutStatus(params.slug);

  // Simulate fetching relevant pitch data
  const scoutId = params.slug; // Or map this slug to a proper scoutId
  const pitchId = "some-pitch-id"; // Replace with actual pitchId logic 

  const investorPitchData = await getInvestorPitchData({ scoutId, pitchId });

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ScoutSidebar
        isPlanning={status.isPlanning}
        isScheduling={status.isScheduling}
      />
      <div className="flex-1">
        {status.isPlanning ? (
          <div className="flex-1 flex h-full items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Set up your scout from the studio.
              </p>
            </div>
          </div>
        ) : status.isScheduling ? (
          <div className="p-4 h-full flex items-center justify-center">
            <p className="text-muted-foreground">
              Your scout is scheduled and will be live on {status.scheduledDate}
              .
            </p>
          </div>
        ) : investorPitchData && investorPitchData.length > 0 ? (
          <div className="p-4">
            {/* Render pitch info, or keep children */}
            <pre className="text-sm bg-muted p-2 rounded">
              {JSON.stringify(investorPitchData, null, 2)}
            </pre>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
