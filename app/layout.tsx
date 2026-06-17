import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { VoiceCallWidget } from "@/components/VoiceCallWidget";
import { LiveChatWidget } from "@/components/LiveChatWidget";
import { ImmersiveLayout } from "@/components/immersive/ImmersiveLayout";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DEALFLOW AI — GTM & Revenue Operations",
  description:
    "AI agents for revenue teams. Pipeline intelligence, persistent memory, and autonomous outreach — from ICP to closed deal.",
  openGraph: {
    title: "DEALFLOW AI — GTM & Revenue Operations",
    description: "AI agents for revenue teams. Pipeline intelligence, persistent memory, and autonomous outreach — from ICP to closed deal.",
    type: "website",
    locale: "en_US",
    siteName: "DealFlow AI",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "DealFlow AI GTM & Revenue Operations Platform",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DEALFLOW AI — GTM & Revenue Operations",
    description: "AI agents for revenue teams. Pipeline intelligence, persistent memory, and autonomous outreach — from ICP to closed deal.",
    images: ["/opengraph-image.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('df_theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                  
                  var bannerDismissed = localStorage.getItem('df_banner_dismissed');
                  if (bannerDismissed === 'true') {
                    document.documentElement.setAttribute('data-banner-dismissed', 'true');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <link rel="preconnect" href="https://cal.com" />
        <link rel="dns-prefetch" href="https://cal.com" />
        <link rel="preconnect" href="https://app.cal.com" />
        <link rel="dns-prefetch" href="https://app.cal.com" />
        <link rel="preload" as="script" href="https://app.cal.com/embed/embed.js" />
        <link rel="preconnect" href="https://calendly.com" />
        <link rel="dns-prefetch" href="https://calendly.com" />
      </head>
      <body
        className={`${sans.variable} min-h-screen bg-background font-sans text-foreground antialiased flex flex-col`}
        suppressHydrationWarning
      >

        <ImmersiveLayout
          header={<Header />}
          footer={<Footer />}
        >
          <div id="main-content">
            {children}
          </div>
        </ImmersiveLayout>
        
        <AIChatAssistant />
        <VoiceCallWidget />
        <LiveChatWidget />
      </body>
    </html>
  );
}
