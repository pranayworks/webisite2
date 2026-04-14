"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"

// Leaflet must load client-side only (no SSR)
const MapWithNoSSR = dynamic(() => import("./LeafletMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1a1c18] rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-[#b2f432] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#c2caaf] text-sm">Loading Map...</p>
      </div>
    </div>
  )
})

export interface PlantingSite {
  id: string
  name: string
  location: string
  lat: number
  lng: number
  trees: number
  status: string
  date?: string
  occasion?: string
}

interface TreeMapProps {
  sites: PlantingSite[]
}

export default function TreeMap({ sites }: TreeMapProps) {
  return <MapWithNoSSR sites={sites} />
}
