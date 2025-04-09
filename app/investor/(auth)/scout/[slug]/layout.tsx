import { ScoutSidebar } from "@/components/navbar/scout-sidebar";

async function getScoutStatus({ scoutId }: { scoutId: string }) {
  const res = await fetch(
    `${process.env.BASE_URL}/api/endpoints/scouts/getStatus?scoutId=${scoutId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!(res.status === 200)) {
    console.error("Failed to fetch scout status", res.status);
    return res.json();
  }

  const json = await res.json();
  console.log(json);
  return json;
}

export default async function ScoutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const { slug } = await params;
  const res = await fetch(
    `${process.env.BASE_URL}/api/endpoints/scouts/getStatus?scoutId=${slug}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!(res.status === 200)) {
    console.error("Failed to fetch scout status", res.status);
  }

  const json = await res.json();
  const { status, name } = await json;
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ScoutSidebar
        scoutSlug={name}
        isPlanning={status === "Planning"}
        isScheduling={status === "Scheduled"}
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
        ) : (
          children
        )}
      </div>
    </div>
  );
}
