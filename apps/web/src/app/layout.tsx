import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import type { Metadata } from "next";
import type React from "react";
import { Suspense } from "react";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "StreamHub - Live Streaming Platform",
  description: "Professional live streaming platform for creators and viewers",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans`}>
        <Suspense fallback={null}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
