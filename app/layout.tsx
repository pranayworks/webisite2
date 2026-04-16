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
  title: {
    default: "Arboretum | Your Digital Ecological Legacy",
    template: "%s | Arboretum",
  },
  description: "Plant a tree, grow your legacy. A sustainable platform for digital stewardship and ecological restoration.",
  keywords: ["Arboretum", "Nature", "Digital Stewardship", "Sustainability", "Reforestation"],
  authors: [{ name: "Green Legacy Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://arboretum.green",
    siteName: "Arboretum",
    title: "Arboretum | Plant Your Legacy",
    description: "Join the digital wilderness. Every tree you plant fosters a new era of stewardship.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Arboretum Visual Legacy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arboretum | Digital Stewardship",
    description: "Your ecological legacy starts with a single seed.",
    images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200"],
  },
  icons: {
    icon: "/favicon.ico",
  },
}

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
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <LoadingScreen />
          {children}
          <Toaster position="top-right" richColors theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  )
}
