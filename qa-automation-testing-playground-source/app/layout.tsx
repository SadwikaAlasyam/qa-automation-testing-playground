import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://sadwika-alasyam-portfolio.sadwika2525.chatgpt.site"),
  title: "QA Automation Testing Playground",
  description: "A hands-on QA automation testing playground by Sadwika Alasyam with practical UI, API, database, authentication, accessibility, and reliability scenarios.",
  openGraph: {
    title: "QA Automation Testing Playground",
    description: "Practice realistic UI, API, database, authentication, accessibility, and reliability testing.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "QA Automation Testing Playground by Sadwika Alasyam" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QA Automation Testing Playground",
    description: "A practical automation testing environment by Sadwika Alasyam.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a className="sr-only focus:not-sr-only" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
