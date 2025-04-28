import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";
import Script from "next/script";

export const metadata: Metadata = {
  title: " Simplifying Startup Pitching",
  description:
    "Share your story in 2.5min and connect with investors who want to back you at the idea or MVP stage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <head>
        {/* Google Analytics Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QBDCP6LQ5W"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QBDCP6LQ5W');
          `}
        </Script>
      </head>
      <body className={`subpixel-antialiased font-poppins`}>
        <ToastProvider>
          <div className="relative flex min-h-screen bg-[#0e0e0e] flex-col">
            {children}
            <Footer />
          </div>
        </ToastProvider>
        <Toaster />
      </body>
    </html>
  );
}
