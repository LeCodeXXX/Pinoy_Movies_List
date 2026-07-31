import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteFooter from "./components/SiteFooter";
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
  title: "Pinoy Movies List",
  description: "Discover Filipino films and track your favorites and ratings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
