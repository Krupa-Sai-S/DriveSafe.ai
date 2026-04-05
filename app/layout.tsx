import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"


import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"
import { GridPattern } from "@/components/ui/grid-pattern"
import { cn } from "@/lib/utils"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "DriveSafe Vision AI",
    template: "DriveSafe Vision AI | %s",
  },
  description:
    "Advanced AI-powered driver monitoring system using MediaPipe for real-time fatigue, distraction, and health monitoring safety alerts",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "DriveSafe Vision AI | Premium Driver Monitoring",
    description: "Advanced AI-powered driver monitoring system for real-time fatigue and distraction detection.",
    url: "https://drive-safeai.vercel.app",
    siteName: "DriveSafe Vision AI",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "DriveSafe Vision AI Shield Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DriveSafe Vision AI",
    description: "Safety monitoring for drivers using real-time AI and facial landmarks.",
    images: ["/opengraph-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          /* Hide Botpress floating widget button */
          #bp-web-widget,
          [id^="bp-web-widget"],
          .bpw-widget-btn,
          .bpw-floating-button,
          [data-botpress],
          div[style*="z-index: 9999"] > div:last-child,
          iframe[src*="botpress"],
          iframe[src*="bpcontent"] { display: none !important; }
        `}</style>
      </head>
      <body className={`font-sans antialiased`}>
        <Script
          src="https://cdn.botpress.cloud/webchat/v3.5/inject.js"
          strategy="beforeInteractive"
        />
        <Script id="override-botpress-title" strategy="beforeInteractive">
          {`
            // Override the setAttribute method to prevent title attributes
            (function() {
              const originalSetAttribute = Element.prototype.setAttribute;
              Element.prototype.setAttribute = function(name, value) {
                if (name === 'title' && (
                  value.toLowerCase().includes('botpress') ||
                  value.toLowerCase().includes('webchat') ||
                  value.toLowerCase().includes('chat') ||
                  this.tagName === 'IFRAME' && (this.src?.includes('botpress') || this.src?.includes('bpcontent'))
                )) {
                  // Don't set the title attribute
                  return;
                }
                return originalSetAttribute.call(this, name, value);
              };
            })();
          `}
        </Script>
        <Script
          src="https://files.bpcontent.cloud/2025/11/29/07/20251129075100-8FFY8UUY.js"
          strategy="beforeInteractive"
        />
        <Script id="remove-botpress-tooltips" strategy="beforeInteractive">
          {`
            function removeAllTooltips() {
              // More aggressive approach - remove ALL title attributes from iframes
              document.querySelectorAll('iframe').forEach(iframe => {
                if (iframe.hasAttribute('title')) {
                  iframe.removeAttribute('title');
                  iframe.title = '';
                }
                
                // Override the title property completely
                try {
                  Object.defineProperty(iframe, 'title', {
                    get: function() { return ''; },
                    set: function() { /* Do nothing */ },
                    configurable: true
                  });
                } catch(e) {}
              });
              
              // Remove titles from buttons and divs that might be chat widgets
              document.querySelectorAll('button, div').forEach(el => {
                const title = el.getAttribute('title');
                if (title && (
                  title.toLowerCase().includes('botpress') ||
                  title.toLowerCase().includes('webchat') ||
                  title.toLowerCase().includes('chat') ||
                  title.toLowerCase().includes('bot')
                )) {
                  el.removeAttribute('title');
                  el.title = '';
                }
              });
            }
            
            // Run immediately
            removeAllTooltips();
            
            // Enhanced mutation observer
            const tooltipObserver = new MutationObserver((mutations) => {
              let shouldRun = false;
              mutations.forEach(mutation => {
                if (mutation.type === 'childList' || 
                    (mutation.type === 'attributes' && mutation.attributeName === 'title')) {
                  shouldRun = true;
                }
              });
              if (shouldRun) {
                setTimeout(removeAllTooltips, 50);
              }
            });
            
            tooltipObserver.observe(document.documentElement, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['title']
            });
            
            // Run after delays to catch late additions
            setTimeout(removeAllTooltips, 1000);
            setTimeout(removeAllTooltips, 3000);
            setTimeout(removeAllTooltips, 5000);
            
            // Run on window events
            window.addEventListener('load', () => setTimeout(removeAllTooltips, 100));
            document.addEventListener('DOMContentLoaded', () => setTimeout(removeAllTooltips, 100));
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col relative w-full overflow-x-hidden pt-16">
            <GridPattern
              width={50}
              height={50}
              x={-1}
              y={-1}
              squares={[
                [4, 4],
                [5, 1],
                [8, 2],
                [5, 3],
                [5, 5],
                [10, 10],
                [12, 15],
                [15, 10],
                [10, 15],
              ]}
              className={cn(
                "[mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-50 fixed inset-0 z-0",
              )}
            />
            {children}
            <Footer />
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
