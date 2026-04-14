"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet"
import L from "leaflet"
import type { PlantingSite } from "./TreeMap"
import "leaflet/dist/leaflet.css"

// Fix default marker icons in webpack/Next.js
const greenIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 36px; height: 36px;
      background: #b2f432;
      border: 3px solid #233600;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(178,244,50,0.5);
    ">
      <div style="
        width: 12px; height: 12px;
        background: #233600;
        border-radius: 50%;
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -40],
})

const pendingIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px; height: 32px;
      background: #f59e0b;
      border: 3px solid #78350f;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(245,158,11,0.5);
    ">
      <div style="
        width: 10px; height: 10px;
        background: #78350f;
        border-radius: 50%;
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
})

interface LeafletMapProps {
  sites: PlantingSite[]
}

export default function LeafletMap({ sites }: LeafletMapProps) {
  // India center
  const defaultCenter: [number, number] = [20.5937, 78.9629]
  const defaultZoom = sites.length > 0 ? 5 : 5

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
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
          icon={site.status === "Planted" ? greenIcon : pendingIcon}
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
              {site.date && (
                <p style={{ margin: "0", fontSize: "10px", color: "#9ca3af" }}>
                  {site.date}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {sites.length === 0 && (
        <Marker position={[11.0168, 76.9558]} icon={greenIcon}>
          <Popup>
            <div style={{ fontFamily: "sans-serif", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#121410" }}>🌱 Your trees will appear here after planting!</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
