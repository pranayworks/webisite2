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
    default: "Green Legacy | Grow Your Botanical Heritage",
    template: "%s | Green Legacy"
  },
  description: "Plant a tree, create a legacy. Join the Green Legacy community for ecological restoration and digital stewardship.",
  keywords: ["Green Legacy", "Nature", "Tree Plantation", "Sustainability", "Reforestation"],
  authors: [{ name: "Green Legacy Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://greenlegacy.in",
    siteName: "Green Legacy",
    title: "Green Legacy | Plant Your Future",
    description: "Your ecological legacy starts here. Every tree matters.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Green Legacy Nature",
      },
    ],
  },
  icons: {
    icon: "https://cdn-icons-png.flaticon.com/512/892/892926.png", // High-quality Leaf Icon
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
