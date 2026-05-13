import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "DEALFLOW AI — Marketing & Sales Automation",
  description:
    "AI-powered analysis, tailored DEALFLOW AI solutions, and an autonomous sales agent for your next demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://cal.com" />
        <link rel="dns-prefetch" href="https://cal.com" />
        <link rel="preconnect" href="https://app.cal.com" />
        <link rel="dns-prefetch" href="https://app.cal.com" />
        <link rel="preload" as="script" href="https://app.cal.com/embed/embed.js" />
        <link rel="preconnect" href="https://calendly.com" />
        <link rel="dns-prefetch" href="https://calendly.com" />
      </head>
      <body
        className={`${inter.variable} min-h-screen bg-dealflow-blue font-sans text-foreground antialiased flex flex-col`}
      >
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.25),transparent)]" />
        
        <Header />
        
        <div className="relative z-10 flex-grow">
          {children}
        </div>

        <Footer />
        <AIChatAssistant />
        <ExitIntentPopup />
      </body>
    </html>
  );
}
