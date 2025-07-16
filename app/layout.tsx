import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import MobileBlocker from "@/components/MobileBlocker";

export const metadata: Metadata = {
  title: "Daftar OS",
  description:
    "Simplifying Startup Scouting and Pitching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics External Script */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QBDCP6LQ5W"></script>
        {/* Google Analytics Inline Script */}
        <script
          async
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QBDCP6LQ5W');
              console.log('Google Analytics tag loaded in <head>');
            `,
          }}
        />
      </head>
      <body className="subpixel-antialiased font-poppins">
        <ToastProvider>
          <MobileBlocker>
            <ErrorBoundary>
              <div className="flex min-h-screen bg-[#0e0e0e] flex-col">
                {children}
              </div>
              <Footer />
            </ErrorBoundary>
          </MobileBlocker>
        </ToastProvider>
        <Toaster />
      </body>
    </html>
  );
}