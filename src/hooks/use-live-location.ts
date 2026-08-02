/**
 * useLiveLocation — manages:
 *   1. navigator.geolocation.watchPosition for own GPS
 *   2. Periodic POST /api/location/update (every 5 s)
 *   3. WebSocket subscription for partner updates
 *   4. Haversine distance calculation
 *   5. Graceful fallback to mock data when backend unreachable
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type LatLng,
  type LocationState,
  createLocationWs,
  fetchBothLocations,
  formatDistance,
  formatOnlineStatus,
  getMockLocation,
  haversineMetres,
  isOnline,
  postLocationUpdate,
  setMockLocation,
} from "@/lib/location";
import { getStoredUser } from "@/lib/auth";
import { HIM, HER } from "@/lib/kp-data";

export type PermissionStatus = "prompt" | "granted" | "denied" | "loading";

export interface LiveLocationData {
  myLocation:      LocationState | null;
  partnerLocation: LocationState | null;
  distanceText:    string | null;
  partnerStatus:   string | null;
  permissionStatus: PermissionStatus;
  isTracking:      boolean;
  requestPermission: () => void;
  recenterMe:      () => void;
  recenterPartner: () => void;
  centerBoth:      () => void;
  mapTarget:       LatLng | null;
}

const UPDATE_INTERVAL_MS = 5_000;

export function useLiveLocation(): LiveLocationData {
  const user = getStoredUser();
  const isBoyfriend = user?.role === "Boyfriend";
  const myUsername      = isBoyfriend ? HIM.short : HER.short;
  const partnerUsername = isBoyfriend ? HER.short : HIM.short;

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>("prompt");
  const [myLocation,      setMyLocation]      = useState<LocationState | null>(null);
  const [partnerLocation, setPartnerLocation] = useState<LocationState | null>(null);
  const [mapTarget,       setMapTarget]       = useState<LatLng | null>(null);
  const [isTracking,      setIsTracking]      = useState(false);

  const watchIdRef    = useRef<number | null>(null);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef         = useRef<WebSocket | null>(null);
  const latestPosRef  = useRef<LatLng | null>(null);

  // ── Load initial partner location from backend / mock ──────────────────────
  useEffect(() => {
    async function loadInitial() {
      const both = await fetchBothLocations();
      if (both?.partner) {
        setPartnerLocation(both.partner);
      } else {
        // Offline fallback — use mock
        const mock = getMockLocation(partnerUsername);
        if (mock) setPartnerLocation(mock);
      }
      if (both?.me) {
        setMyLocation(both.me);
        latestPosRef.current = { latitude: both.me.latitude, longitude: both.me.longitude };
      }
    }
    loadInitial();
  }, [partnerUsername]);

  // ── WebSocket for partner real-time updates ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("kp-access-token") ?? "";
    if (!token) return;

    const ws = createLocationWs(token, (msg) => {
      // Only care about the partner's updates
      setPartnerLocation({
        latitude:  msg.data.latitude,
        longitude: msg.data.longitude,
        updatedAt: msg.data.updated_at,
        online:    isOnline(msg.data.updated_at),
      });
    });
    wsRef.current = ws;

    return () => {
      ws?.close();
      wsRef.current = null;
    };
  }, []);

  // ── Start GPS watching ──────────────────────────────────────────────────────
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    setPermissionStatus("loading");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc: LocationState = {
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
          updatedAt: new Date().toISOString(),
          online: true,
        };
        setMyLocation(loc);
        setMockLocation(myUsername, loc.latitude, loc.longitude);
        latestPosRef.current = { latitude: loc.latitude, longitude: loc.longitude };
        setPermissionStatus("granted");
        setIsTracking(true);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setPermissionStatus(err.code === 1 ? "denied" : "prompt");
        setIsTracking(false);
        // Fall back to mock location
        const mock = getMockLocation(myUsername);
        if (mock) {
          setMyLocation(mock);
          latestPosRef.current = { latitude: mock.latitude, longitude: mock.longitude };
        }
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  }, [myUsername]);

  // ── Periodic POST to backend ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isTracking) return;

    intervalRef.current = setInterval(async () => {
      const pos = latestPosRef.current;
      if (!pos) return;
      const ok = await postLocationUpdate(pos.latitude, pos.longitude);
      if (!ok) {
        // Backend down — update mock so partner simulation still works
        setMockLocation(myUsername, pos.latitude, pos.longitude);
      }
    }, UPDATE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTracking, myUsername]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      wsRef.current?.close();
    };
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────────
  const distanceText = myLocation && partnerLocation
    ? formatDistance(haversineMetres(myLocation, partnerLocation))
    : null;

  const partnerStatus = partnerLocation
    ? formatOnlineStatus(partnerLocation.updatedAt)
    : null;

  // ── Map pan helpers ───────────────────────────────────────────────────────────
  const recenterMe = useCallback(() => {
    if (myLocation) setMapTarget({ latitude: myLocation.latitude, longitude: myLocation.longitude });
  }, [myLocation]);

  const recenterPartner = useCallback(() => {
    if (partnerLocation) setMapTarget({ latitude: partnerLocation.latitude, longitude: partnerLocation.longitude });
  }, [partnerLocation]);

  const centerBoth = useCallback(() => {
    if (myLocation && partnerLocation) {
      setMapTarget({
        latitude:  (myLocation.latitude  + partnerLocation.latitude)  / 2,
        longitude: (myLocation.longitude + partnerLocation.longitude) / 2,
      });
    }
  }, [myLocation, partnerLocation]);

  return {
    myLocation,
    partnerLocation,
    distanceText,
    partnerStatus,
    permissionStatus,
    isTracking,
    requestPermission: startTracking,
    recenterMe,
    recenterPartner,
    centerBoth,
    mapTarget,
  };
}
