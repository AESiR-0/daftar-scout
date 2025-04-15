import { StudioSidebar } from "@/components/navbar/studio-sidebar";
import { PitchProvider } from "@/contexts/PitchContext";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <StudioSidebar />
      <main className="flex-1 overflow-y-auto">
        <PitchProvider>{children}</PitchProvider>
      </main>
    </div>
  );
}
