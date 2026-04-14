"use client"

import { useEffect, useState, useMemo } from "react"
import type { PlantingSite } from "./TreeMap"
import "leaflet/dist/leaflet.css"

interface LeafletMapProps {
  sites: PlantingSite[]
}

export default function LeafletMap({ sites }: LeafletMapProps) {
  const [libs, setLibs] = useState<any>(null)

  // Load everything ONLY on the client
  useEffect(() => {
    Promise.all([
      import("leaflet"),
      import("react-leaflet")
    ]).then(([leaflet, reactLeaflet]) => {
      setLibs({
        L: leaflet.default || leaflet,
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        Popup: reactLeaflet.Popup,
        ZoomControl: reactLeaflet.ZoomControl
      })
    })
  }, [])

  // Define icons only when L is ready
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
          <p className="text-[#c2caaf] text-sm italic">Synchronizing Map Library...</p>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, ZoomControl } = libs

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

      {(Array.isArray(sites) ? sites : []).map((site) => (
        <Marker
          key={site.id}
          position={[site.lat || 20.5937, site.lng || 78.9629]}
          icon={site.status === "Planted" ? icons.greenIcon : icons.pendingIcon}
        >
          <Popup>
            <div style={{ fontFamily: "Manrope, sans-serif", minWidth: "200px" }}>
              <div style={{
                background: site.status === "Planted" ? "#b2f432" : "#f59e0b",
                color: site.status === "Planted" ? "#233600" : "#78350f",
                padding: "4px 10px",
                borderRadius: "50px",
                fontSize: "10px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "inline-block",
                marginBottom: "8px"
              }}>
                {site.status}
              </div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700", color: "#121410" }}>
                🌳 {site.trees} {site.trees === 1 ? "Tree" : "Trees"}
              </h3>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#424935", fontWeight: "600" }}>
                {site.name}
              </p>
              <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
                📍 {site.location}
              </p>
              {site.occasion && (
                <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
                  🎂 {site.occasion}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {(!sites || sites.length === 0) && (
        <Marker position={[11.0168, 76.9558]} icon={icons.greenIcon}>
          <Popup>
            <div style={{ fontFamily: "Manrope, sans-serif", textAlign: "center", padding: "10px" }}>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "700" }}>🌳 Ready to begin?</h3>
              <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>Your trees will appear here after your first planting!</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
