import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UglyDog Clicker - Fast Clicking Game",
  description: "Test your reflexes in the ultimate UglyDog clicking game! Click the UglyDog before it disappears and climb the leaderboard.",
  keywords: ["UglyDog", "Clicker Game", "Reflex Game", "Fast Clicking", "Browser Game", "Leaderboard"],
  authors: [{ name: "UglyDog Team" }],
  openGraph: {
    title: "UglyDog Clicker",
    description: "Test your reflexes in the ultimate UglyDog clicking game!",
    url: "https://your-domain.com",
    siteName: "UglyDog Clicker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UglyDog Clicker",
    description: "Test your reflexes in the ultimate UglyDog clicking game!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/lib/clipboard-fix.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
