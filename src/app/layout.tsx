import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import "@/middleware" // Add middleware import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AiAppsy Web Studio - Complete Web Development Environment",
  description: "Build, test, and deploy web applications in your browser. Monaco editor, terminal, and one-click deployment.",
  keywords: ["AiAppsy", "Web Studio", "Next.js", "TypeScript", "Monaco Editor", "Terminal", "Deployment"],
  authors: [{ name: "AiAppsy Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AiAppsy Web Studio",
    description: "Complete web development environment in your browser",
    url: "https://chat.z.ai",
    siteName: "AiAppsy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AiAppsy Web Studio",
    description: "Complete web development environment in your browser",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
