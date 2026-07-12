import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header.client";
import { Sidebar } from "@/components/layout/sidebar";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TransitOps | Logistics Platform",
  description: "Smart Transport Operations Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-background text-on-background antialiased selection:bg-primary/20 selection:text-primary">
        <div className="mesh-bg pointer-events-none fixed inset-0 z-[-1] bg-surface opacity-60" />

        <Sidebar />
        <Header />

        <main className="min-h-screen flex-1 px-8 pt-28 pb-10 md:ml-72">
          {children}
        </main>
      </body>
    </html>
  );
}
