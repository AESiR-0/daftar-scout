import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Pitch Your Startup in 120 Seconds - Daftar",
  description: "Share your story in 120 seconds and connect with investors who want to back you at the idea or MVP stage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`subpixel-antialiased font-poppins`}>
        <ToastProvider>
          <div className="relative flex min-h-screen flex-col">
            {children}
            <Footer />
          </div>
        </ToastProvider>
        <Toaster />
      </body>
    </html>
  );
}
