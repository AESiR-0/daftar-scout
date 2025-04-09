import { StudioNav } from "@/components/navbar/studio-nav";
import { StudioSidebar } from "@/components/navbar/studio-sidebar";
import { DaftarProvider } from "@/lib/context/daftar-context";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DaftarProvider>
        <StudioSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </DaftarProvider>
    </div>
  );
}
