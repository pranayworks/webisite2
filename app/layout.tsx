import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Noto_Serif, Manrope } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import LoadingScreen from "@/components/LoadingScreen"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["italic", "normal"],
  variable: "--font-noto-serif",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://greenlegacy.in"),
  title: {
    default: "Green Legacy | Plant Your Ecological Future",
    template: "%s | Green Legacy"
  },
  description: "Join Green Legacy to plant trees, offset carbon, and build your botanical heritage. Every tree is a verified step toward a greener Earth.",
  keywords: ["Green Legacy", "Tree Plantation", "Sustainability", "Carbon Offset", "Environmental Protection", "Climate Action", "Stewardship"],
  authors: [{ name: "Green Legacy Team" }],
  creator: "Green Legacy Team",
  publisher: "Green Legacy Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://greenlegacy.in",
    siteName: "Green Legacy",
    title: "Green Legacy | Grow Your Digital Forest",
    description: "Start your stewardship journey today. Verified plantations, GPS tracking, and official certificates.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Green Legacy - Restoration in Action",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Legacy | Plant a Tree, grow a Legacy",
    description: "Your ecological legacy starts here. Join the restoration movement.",
    site: "@GreenLegacy",
    creator: "@GreenLegacy",
    images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "g7Mea5nB9AAO-_H2x8ejJyohoBF-1ZviKsNNkr1G8xQ",
  },
  icons: {
    icon: "https://cdn-icons-png.flaticon.com/512/892/892926.png",
    apple: "https://cdn-icons-png.flaticon.com/512/892/892926.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#121410",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSerif.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" defer></script>
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <LoadingScreen />
          {/* Google Site Name Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Green Legacy",
              "url": "https://greenlegacy.in",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://greenlegacy.in/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        {children}
          <Toaster position="top-right" richColors theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  )
}
