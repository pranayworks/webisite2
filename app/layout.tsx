import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import LoadingScreen from "@/components/LoadingScreen"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Green Legacy - Plant a Tree, Create a Legacy",
  description:
    "India's premier tree plantation startup connecting donors, agriculture colleges, and environmental impact. Plant trees for birthdays, memorials, corporate events and more.",
  keywords: ["tree plantation", "environment", "India", "CSR", "green", "sustainability"],
  icons: {
    icon: "https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1762489952/Screenshot_2025-11-07_095311-removebg-preview_vljmri.png",
    apple: "https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1762489952/Screenshot_2025-11-07_095311-removebg-preview_vljmri.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#2D5016",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <LoadingScreen />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
