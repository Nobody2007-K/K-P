/**
 * LiveMap — React-Leaflet map with avatar markers, distance pill,
 * online status, and smooth panning.
 *
 * Rendered client-side only (no SSR) via a lazy import.
 */
"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { createAvatarIcon } from "@/components/kp/AvatarMarker";
import type { LocationState } from "@/lib/location";

// Fix broken Leaflet default icon paths when bundled with Vite
delete (L.Icon.Default.prototype as Record<string, unknown>)["_getIconUrl"];
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── Pan controller — responds to mapTarget changes ────────────────────────────
function MapPanner({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  const prev = useRef<string>("");
  useEffect(() => {
    if (!target) return;
    const key = `${target.lat},${target.lng}`;
    if (key === prev.current) return;
    prev.current = key;
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 15), {
      animate: true,
      duration: 1.4,
    });
  }, [map, target]);
  return null;
}

// ── Smooth marker transition ──────────────────────────────────────────────────
function SmoothMarker({
  position,
  icon,
  popupContent,
  accuracy,
  accentColor,
}: {
  position: [number, number];
  icon: L.DivIcon;
  popupContent: React.ReactNode;
  accuracy?: number;
  accentColor: string;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const prevPos   = useRef<[number, number]>(position);

  useEffect(() => {
    const m = markerRef.current;
    if (!m) return;
    const [lat, lng] = position;
    const [pLat, pLng] = prevPos.current;
    if (lat === pLat && lng === pLng) return;
    prevPos.current = position;

    // Animate over 600 ms using requestAnimationFrame
    const start     = performance.now();
    const duration  = 600;
    const startLat  = pLat;
    const startLng  = pLng;
    const dLat      = lat - pLat;
    const dLng      = lng - pLng;

    function frame(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);          // ease-out cubic
      m!.setLatLng([startLat + dLat * ease, startLng + dLng * ease]);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [position]);

  return (
    <>
      {accuracy && accuracy > 5 && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            color: accentColor,
            fillColor: accentColor,
            fillOpacity: 0.08,
            weight: 1,
            opacity: 0.3,
          }}
        />
      )}
      <Marker ref={markerRef} position={position} icon={icon}>
        <Popup className="kp-popup">{popupContent}</Popup>
      </Marker>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export interface LiveMapProps {
  myLocation:      LocationState | null;
  partnerLocation: LocationState | null;
  myAvatar:        string;
  myName:          string;
  partnerAvatar:   string;
  partnerName:     string;
  partnerOnline:   boolean;
  mapTarget:       { latitude: number; longitude: number } | null;
  isDark:          boolean;
}

// Kathmandu as default centre
const DEFAULT_CENTER: [number, number] = [27.7103, 85.3222];

export default function LiveMap({
  myLocation,
  partnerLocation,
  myAvatar,
  myName,
  partnerAvatar,
  partnerName,
  partnerOnline,
  mapTarget,
  isDark,
}: LiveMapProps) {
  const myIcon      = createAvatarIcon({ avatarUrl: myAvatar,      label: myName,      isMe: true,  online: true,         tint: "#7E57C2" });
  const partnerIcon = createAvatarIcon({ avatarUrl: partnerAvatar, label: partnerName, isMe: false, online: partnerOnline, tint: "#EC407A" });

  const initialCenter: [number, number] = myLocation
    ? [myLocation.latitude, myLocation.longitude]
    : partnerLocation
      ? [partnerLocation.latitude, partnerLocation.longitude]
      : DEFAULT_CENTER;

  // OpenStreetMap tile — light/dark variant
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      center={initialCenter}
      zoom={15}
      zoomControl={false}
      scrollWheelZoom
      style={{ width: "100%", height: "100%", background: "transparent" }}
      className="rounded-none"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url={tileUrl}
      />

      {/* My marker */}
      {myLocation && (
        <SmoothMarker
          position={[myLocation.latitude, myLocation.longitude]}
          icon={myIcon}
          accentColor="#7E57C2"
          popupContent={
            <div className="text-xs font-medium">
              <strong>{myName}</strong> (You)<br />
              {myLocation.latitude.toFixed(5)}, {myLocation.longitude.toFixed(5)}
            </div>
          }
        />
      )}

      {/* Partner marker */}
      {partnerLocation && (
        <SmoothMarker
          position={[partnerLocation.latitude, partnerLocation.longitude]}
          icon={partnerIcon}
          accentColor="#EC407A"
          popupContent={
            <div className="text-xs font-medium">
              <strong>{partnerName}</strong><br />
              {partnerOnline ? "🟢 Live Now" : "⚪ Recently active"}<br />
              {partnerLocation.latitude.toFixed(5)}, {partnerLocation.longitude.toFixed(5)}
            </div>
          }
        />
      )}

      {/* Pan handler */}
      <MapPanner target={mapTarget ? { lat: mapTarget.latitude, lng: mapTarget.longitude } : null} />
    </MapContainer>
  );
}
