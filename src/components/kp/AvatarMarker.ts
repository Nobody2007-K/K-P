/**
 * Creates a custom Leaflet DivIcon using a profile photo.
 * Returns a Leaflet.DivIcon — import this only in browser context.
 */
import L from "leaflet";

export interface AvatarMarkerOptions {
  avatarUrl: string;
  label: string;
  isMe?: boolean;
  online?: boolean;
  tint?: string;   // CSS color for the ring
}

export function createAvatarIcon(opts: AvatarMarkerOptions): L.DivIcon {
  const { avatarUrl, label, isMe = false, online = false, tint = "#EC407A" } = opts;

  const size    = isMe ? 52 : 46;
  const ring    = isMe ? 3  : 2;
  const pulse   = online && !isMe ? `
    <span style="
      position:absolute; inset:-6px; border-radius:50%;
      border:2px solid ${tint}; opacity:0.45;
      animation:kp-pulse 2s ease-in-out infinite;
    "></span>` : "";

  const html = `
    <style>
      @keyframes kp-pulse {
        0%,100%{ transform:scale(1);   opacity:.45; }
        50%    { transform:scale(1.25);opacity:.15; }
      }
    </style>
    <div style="
      position:relative;
      display:flex;
      flex-direction:column;
      align-items:center;
      filter:drop-shadow(0 4px 12px rgba(0,0,0,.22));
    ">
      ${pulse}
      <div style="
        width:${size}px; height:${size}px;
        border-radius:50%;
        overflow:hidden;
        border:${ring}px solid ${tint};
        box-shadow: 0 0 0 ${ring + 1}px white, 0 4px 14px rgba(0,0,0,.25);
        transition: transform .3s ease;
      ">
        <img src="${avatarUrl}"
          style="width:100%;height:100%;object-fit:cover;"
          alt="${label}"
        />
      </div>
      <div style="
        margin-top:4px;
        background:rgba(255,255,255,.92);
        backdrop-filter:blur(8px);
        border-radius:20px;
        padding:2px 8px;
        font-size:10px;
        font-weight:600;
        color:#1a1a1a;
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,.15);
        border:1px solid rgba(255,255,255,.6);
      ">${isMe ? "📍 You" : label}</div>
      <!-- tail -->
      <div style="
        width:0; height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-top:6px solid ${tint};
        margin-top:-1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",          // no default Leaflet classes
    iconSize:  [size + 16, size + 38],
    iconAnchor:[Math.round((size + 16) / 2), size + 38],
    popupAnchor:[0, -(size + 38)],
  });
}
