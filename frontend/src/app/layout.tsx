import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

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
      <body className="min-h-screen bg-background text-on-background antialiased selection:bg-primary/20 selection:text-primary">
        <div className="mesh-bg pointer-events-none fixed inset-0 z-[-1] bg-surface opacity-60" />
        {children}
      </body>
    </html>
  );
}
