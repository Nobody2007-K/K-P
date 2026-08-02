import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Crosshair, Users, ZoomIn, ZoomOut,
  Navigation, Clock, Heart, MapPin, Wifi, WifiOff,
} from "lucide-react";
import { BottomNav } from "@/components/kp/Shell";
import LocationPermission from "@/components/kp/LocationPermission";
import { HIM, HER } from "@/lib/kp-data";
import { getStoredUser } from "@/lib/auth";
import { useLiveLocation } from "@/hooks/use-live-location";
import { useTheme } from "@/hooks/use-theme";
import { isOnline, formatOnlineStatus } from "@/lib/location";

// Lazy-load the Leaflet map so it never runs on the server (SSR safe)
const LiveMap = lazy(() => import("@/components/kp/LiveMap"));

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Location — K&P Love" },
      { name: "description", content: "See where your person is, in real time." },
    ],
  }),
  component: MapScreen,
});

// ── Loading spinner shown while Leaflet initialises ───────────────────────────
function MapLoading() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
      <div className="gradient-love shadow-glow mb-5 flex size-20 items-center justify-center rounded-3xl animate-float">
        <MapPin className="size-9 text-primary-foreground" />
      </div>
      <div className="flex items-center gap-2">
        <span className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Finding your location…</p>
      </div>
      <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Heart className="size-3 text-primary" fill="currentColor" />
        Connecting hearts via GPS
      </p>
    </div>
  );
}

// ── Zoom controller (accesses Leaflet map from outside) ───────────────────────
function ZoomControls({ mapRef }: { mapRef: React.RefObject<{ zoomIn: () => void; zoomOut: () => void } | null> }) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => mapRef.current?.zoomIn()}
        aria-label="Zoom in"
        className="glass flex size-11 items-center justify-center rounded-2xl transition-transform active:scale-90"
      >
        <ZoomIn className="size-5 text-foreground" />
      </button>
      <button
        onClick={() => mapRef.current?.zoomOut()}
        aria-label="Zoom out"
        className="glass flex size-11 items-center justify-center rounded-2xl transition-transform active:scale-90"
      >
        <ZoomOut className="size-5 text-foreground" />
      </button>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
function MapScreen() {
  const navigate = useNavigate();
  const user     = getStoredUser();
  const { dark } = useTheme();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  const {
    myLocation,
    partnerLocation,
    distanceText,
    partnerStatus,
    permissionStatus,
    isTracking,
    requestPermission,
    recenterMe,
    recenterPartner,
    centerBoth,
    mapTarget,
  } = useLiveLocation();

  // Map instance ref for zoom controls
  const leafletMapRef = useRef<{ zoomIn: () => void; zoomOut: () => void } | null>(null);

  const [infoTarget, setInfoTarget] = useState<"me" | "partner">("partner");

  if (!user) return null;

  const isBoyfriend  = user.role === "Boyfriend";
  const me           = isBoyfriend ? HIM : HER;
  const partner      = isBoyfriend ? HER : HIM;
  const partnerOnline = partnerLocation ? isOnline(partnerLocation.updatedAt) : false;

  const displayLocation = infoTarget === "me" ? myLocation : partnerLocation;
  const displayPerson   = infoTarget === "me" ? me         : partner;

  // ── Permission screens ──────────────────────────────────────────────────────
  if (permissionStatus === "prompt") {
    return (
      <div className="relative">
        <LocationPermission onRequest={requestPermission} />
        <BottomNav />
      </div>
    );
  }

  if (permissionStatus === "denied") {
    return (
      <div className="relative">
        <LocationPermission onRequest={requestPermission} denied />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">

      {/* ── Full-screen map ── */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<MapLoading />}>
          <LiveMap
            myLocation={myLocation}
            partnerLocation={partnerLocation}
            myAvatar={me.avatar}
            myName={me.short}
            partnerAvatar={partner.avatar}
            partnerName={partner.short}
            partnerOnline={partnerOnline}
            mapTarget={mapTarget}
            isDark={dark}
          />
        </Suspense>
        {permissionStatus === "loading" && <MapLoading />}
      </div>

      {/* ── Top distance pill ── */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-center gap-3">
        <div className="glass flex flex-1 items-center gap-3 rounded-3xl px-4 py-3 pointer-events-auto">
          {/* Avatars */}
          <div className="flex items-center -space-x-2 shrink-0">
            <img src={me.avatar} alt={me.short} width={40} height={40}
              className="size-9 rounded-full object-cover ring-2 ring-background z-10" />
            <img src={partner.avatar} alt={partner.short} width={40} height={40}
              className="size-9 rounded-full object-cover ring-2 ring-background" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {distanceText ?? "Calculating…"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {partnerOnline
                ? <Wifi    className="size-3 text-green-500 shrink-0" />
                : <WifiOff className="size-3 text-muted-foreground shrink-0" />}
              <p className="text-[11px] text-muted-foreground truncate">
                {partnerStatus ?? `${partner.short}'s location loading…`}
              </p>
            </div>
          </div>

          {/* Tracking indicator */}
          {isTracking && (
            <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-600 shrink-0">
              <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* ── Right controls ── */}
      <div className="absolute right-4 top-24 z-10 flex flex-col gap-2">
        <button
          onClick={() => { recenterMe(); setInfoTarget("me"); }}
          aria-label="Center on me"
          className="glass flex size-11 items-center justify-center rounded-2xl transition-transform active:scale-90"
        >
          <Crosshair className="size-5 text-foreground" />
        </button>
        <button
          onClick={() => { recenterPartner(); setInfoTarget("partner"); }}
          aria-label="Center on partner"
          className="glass flex size-11 items-center justify-center rounded-2xl transition-transform active:scale-90"
        >
          <Heart className="size-4 text-primary" fill="currentColor" />
        </button>
        <button
          onClick={centerBoth}
          aria-label="Show both"
          className="glass flex size-11 items-center justify-center rounded-2xl transition-transform active:scale-90"
        >
          <Users className="size-5 text-foreground" />
        </button>
        <ZoomControls mapRef={leafletMapRef} />
      </div>

      {/* ── Bottom info card ── */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-auto">
        <div className="glass mx-0 rounded-t-3xl px-5 pt-4 pb-28">
          {/* Drag handle */}
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

          {/* Person switcher */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            {([{ person: me, key: "me" as const }, { person: partner, key: "partner" as const }]).map(({ person, key }) => (
              <button
                key={key}
                onClick={() => {
                  setInfoTarget(key);
                  if (key === "me") recenterMe();
                  else recenterPartner();
                }}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 transition-all duration-200 ${
                  infoTarget === key
                    ? "bg-primary/12 ring-1 ring-primary/30"
                    : "bg-background/50 hover:bg-background/70"
                }`}
              >
                <div className="relative shrink-0">
                  <img src={person.avatar} alt={person.short} width={40} height={40}
                    className="size-9 rounded-full object-cover" />
                  {/* Online dot */}
                  {key === "me" && isTracking && (
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-400 ring-1 ring-background" />
                  )}
                  {key === "partner" && partnerOnline && (
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-400 ring-1 ring-background" />
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <p className={`text-xs font-semibold truncate ${infoTarget === key ? "text-primary" : "text-foreground"}`}>
                    {key === "me" ? "You" : person.short}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {key === "me"
                      ? (isTracking ? "🟢 Sharing" : "📍 Tap to share")
                      : (partnerOnline ? "🟢 Live" : "⚪ Recently")}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Selected person detail */}
          {displayLocation ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={displayPerson.avatar} alt={displayPerson.short} width={56} height={56}
                  className="size-12 rounded-2xl object-cover ring-2 ring-primary/25" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {infoTarget === "me" ? `${displayPerson.short} (You)` : displayPerson.short}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Navigation className="size-3" />
                    {displayLocation.latitude.toFixed(4)}, {displayLocation.longitude.toFixed(4)}
                  </p>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                  (infoTarget === "me" ? isTracking : partnerOnline)
                    ? "bg-green-500/15 text-green-600"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <span className={`size-1.5 rounded-full ${
                    (infoTarget === "me" ? isTracking : partnerOnline) ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                  }`} />
                  {infoTarget === "me" ? (isTracking ? "Live" : "Idle") : (partnerOnline ? "Live" : "Away")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <InfoCell
                  icon={<MapPin className="size-3.5" />}
                  label="Latitude"
                  value={displayLocation.latitude.toFixed(6)}
                />
                <InfoCell
                  icon={<MapPin className="size-3.5" />}
                  label="Longitude"
                  value={displayLocation.longitude.toFixed(6)}
                />
                <InfoCell
                  icon={<Clock className="size-3.5" />}
                  label="Updated"
                  value={formatOnlineStatus(displayLocation.updatedAt).replace(/^[🟢⚪]\s*/, "")}
                />
                <InfoCell
                  icon={<Heart className="size-3.5 text-primary" />}
                  label="Distance"
                  value={distanceText?.replace(" ❤️", "") ?? "—"}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <MapPin className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {infoTarget === "me"
                  ? "Tap Enable Location to start sharing"
                  : `${partner.short}'s location isn't available yet`}
              </p>
              {infoTarget === "me" && permissionStatus === "prompt" && (
                <button onClick={requestPermission}
                  className="gradient-love mt-2 rounded-full px-5 py-2 text-xs font-semibold text-primary-foreground">
                  Enable Location
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

// ── Info cell ─────────────────────────────────────────────────────────────────
function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/60 px-3 py-2">
      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">{icon}{label}</p>
      <p className="mt-0.5 text-xs font-medium truncate">{value}</p>
    </div>
  );
}
