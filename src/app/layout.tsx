import type { Metadata } from "next";
import "./styles/globals.css";
import Header from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MobileTabs } from "@/components/MobileTabs";

export const metadata: Metadata = {
  title: "Zaptube - Decentralized Video Sharing",
  description: "Zaptube is a decentralized video sharing platform built on the Nostr protocol, allowing users to upload, share, and watch videos without censorship or central control.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
        <MobileTabs />
      </body>
    </html>
  );
}
