"use client"

import { useEffect } from "react"

export function AppEngine() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.hostname !== "localhost") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Green Legacy App Engine: Online", reg))
          .catch((err) => console.error("Green Legacy App Engine: Offline", err))
      })
    }

    // Disable zooming on mobile to feel like a native app
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    document.addEventListener("touchstart", preventZoom, { passive: false })
    
    return () => document.removeEventListener("touchstart", preventZoom)
  }, [])

  return null
}
