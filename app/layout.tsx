import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/app/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe Leading",
  description: "Vibe Leading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1 pb-14">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
