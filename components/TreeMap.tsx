"use client"

import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"

interface PlantingSite {
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

interface MapProps {
  sites: PlantingSite[]
}

// Inner component that actually uses Leaflet
function MapInternal({ sites }: MapProps) {
  const [libs, setLibs] = useState<any>(null)

  useEffect(() => {
    // Load Leaflet and React-Leaflet together only on the client
    Promise.all([
      import("leaflet"),
      import("react-leaflet")
    ]).then(([LMod, RLMod]) => {
      setLibs({
        L: LMod.default || LMod,
        RL: RLMod
      })
    })
  }, [])

  const icons = useMemo(() => {
    if (!libs?.L) return null
    const L = libs.L

    const greenIcon = L.divIcon({
      className: "",
      html: `
        <div style="width: 36px; height: 36px; background: #b2f432; border: 3px solid #233600; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 12px rgba(178,244,50,0.5);">
          <div style="width: 12px; height: 12px; background: #233600; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
        </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -40],
    })

    const pendingIcon = L.divIcon({
      className: "",
      html: `
        <div style="width: 32px; height: 32px; background: #f59e0b; border: 3px solid #78350f; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 12px rgba(245,158,11,0.5);">
          <div style="width: 10px; height: 10px; background: #78350f; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
        </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -36],
    })

    return { greenIcon, pendingIcon }
  }, [libs])

  if (!libs || !icons) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1c18]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#b2f432] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#c2caaf] text-sm italic">Calibrating Map...</p>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, ZoomControl } = libs.RL

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ width: "100%", height: "100%", borderRadius: "16px" }}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {sites.map((site) => (
        <Marker 
          key={site.id} 
          position={[site.lat, site.lng]} 
          icon={site.status === "Planted" ? icons.greenIcon : icons.pendingIcon}
        >
          <Popup>
            <div style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
              <strong>{site.name}</strong><br/>
              {site.trees} Trees ({site.status})
            </div>
          </Popup>
        </Marker>
      ))}

      {sites.length === 0 && (
         <Marker position={[11.0168, 76.9558]} icon={icons.greenIcon}>
            <Popup>Ready to plant!</Popup>
         </Marker>
      )}
    </MapContainer>
  )
}

// Wrapper that ensures absolute zero SSR
export default function TreeMap({ sites }: MapProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div className="w-full h-full flex items-center justify-center bg-[#1a1c18] rounded-2xl">
      <div className="h-8 w-8 border-2 border-[#b2f432] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return <MapInternal sites={sites} />
}
