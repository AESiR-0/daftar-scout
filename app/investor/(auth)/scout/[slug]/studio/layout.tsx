import { StudioSidebar } from "@/components/navbar/studio-sidebar";
import { DaftarProvider } from "@/lib/context/daftar-context";
import { IsScoutLockedProvider } from "@/contexts/isScoutLockedContext";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DaftarProvider>
        <IsScoutLockedProvider>
          <StudioSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </IsScoutLockedProvider>
      </DaftarProvider>
    </div>
  );
}
