import { MapPin, Heart } from "lucide-react";

interface Props {
  onRequest: () => void;
  denied?: boolean;
}

export default function LocationPermission({ onRequest, denied = false }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="glass animate-rise flex max-w-sm flex-col items-center rounded-3xl p-8 text-center shadow-glow">
        <div className="gradient-love mb-5 flex size-20 items-center justify-center rounded-3xl shadow-glow">
          <MapPin className="size-9 text-primary-foreground" />
        </div>

        <h2 className="text-xl font-semibold">
          {denied ? "Location Access Denied" : "Enable Live Location"}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {denied
            ? "Location permission was denied. Please enable it in your browser settings, then try again."
            : "K&P Love needs your location to show your position on the map and let your partner see where you are in real time."}
        </p>

        {!denied && (
          <button
            onClick={onRequest}
            className="gradient-love shadow-glow mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            <MapPin className="size-4" />
            Enable Location
          </button>
        )}

        {denied && (
          <button
            onClick={onRequest}
            className="mt-5 flex h-11 items-center gap-2 rounded-full bg-secondary px-6 text-sm font-medium text-secondary-foreground transition-transform active:scale-95"
          >
            Try Again
          </button>
        )}

        <p className="mt-4 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Heart className="size-3 text-primary" fill="currentColor" />
          Only shared with {" "}
          <span className="font-medium text-foreground">your partner</span>
        </p>
      </div>
    </div>
  );
}
