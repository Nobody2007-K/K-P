import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart, Plus, MapPin, X, ImagePlus, Loader2, Video,
} from "lucide-react";
import { useState, useRef } from "react";
import { Screen, ScreenHeader } from "@/components/kp/Shell";
import { fetchMemories, createMemory, type MemoryOut } from "@/lib/api";

export const Route = createFileRoute("/memories/")({
  head: () => ({
    meta: [
      { title: "Memories — K&P Love" },
      { name: "description", content: "A private gallery of the moments you two keep coming back to." },
      { property: "og:title", content: "Memories — K&P Love" },
      { property: "og:description", content: "A private gallery for two." },
    ],
  }),
  component: MemoriesScreen,
});

// ── Upload dialog ─────────────────────────────────────────────────────────────
function UploadDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createMemory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setFileType(isVideo ? "video" : "image");
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Please choose a photo or video first."); return; }
    const form = new FormData();
    if (fileType === "video") form.append("video", file);
    else form.append("image", file);
    if (caption.trim()) form.append("caption", caption.trim());
    if (location.trim()) form.append("location_name", location.trim());
    mutation.mutate(form);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-rise w-full max-w-lg rounded-t-3xl bg-card p-6 pb-10 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add a Memory</h2>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* File picker */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-secondary text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            {preview ? (
              fileType === "video" ? (
                <video src={preview} className="h-full w-full rounded-2xl object-cover" muted />
              ) : (
                <img src={preview} alt="preview" className="h-full w-full rounded-2xl object-cover" />
              )
            ) : (
              <>
                <ImagePlus className="size-8" />
                <span className="text-sm font-medium">Tap to choose photo or video</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleFile}
          />

          {/* Caption */}
          <input
            type="text"
            placeholder="Add a caption… (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            className="rounded-2xl bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />

          {/* Location */}
          <input
            type="text"
            placeholder="Where was this? (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={255}
            className="rounded-2xl bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="gradient-love flex h-12 items-center justify-center gap-2 rounded-2xl font-semibold text-primary-foreground shadow-glow transition-transform active:scale-95 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <><Loader2 className="size-4 animate-spin" /> Uploading…</>
            ) : (
              <><Video className="size-4" /> Save Memory</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Memory card ───────────────────────────────────────────────────────────────
function MemoryCard({ m, index }: { m: MemoryOut; index: number }) {
  const mediaSrc = m.image_url ?? m.video_url;
  const isVideo = !m.image_url && !!m.video_url;
  const date = new Date(m.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Link
      to="/memories/$memoryId"
      params={{ memoryId: m.id }}
      style={{ animationDelay: `${index * 70}ms` }}
      className="animate-rise mb-3 block break-inside-avoid overflow-hidden rounded-3xl bg-card shadow-soft transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98]"
    >
      <div className="relative">
        {isVideo ? (
          <video
            src={mediaSrc ?? undefined}
            className="h-48 w-full object-cover"
            muted
            playsInline
          />
        ) : (
          <img
            src={mediaSrc ?? undefined}
            alt={m.caption ?? "Memory"}
            loading="lazy"
            className="h-48 w-full object-cover"
          />
        )}
        {isVideo && (
          <span className="glass absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-foreground">
            VIDEO
          </span>
        )}
      </div>
      <div className="p-3">
        {m.caption && (
          <p className="text-sm font-medium leading-snug">{m.caption}</p>
        )}
        {m.location_name && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3" /> {m.location_name}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">{date}</p>
      </div>
    </Link>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
function MemoriesScreen() {
  const [showUpload, setShowUpload] = useState(false);

  const { data: memories = [], isLoading, isError } = useQuery({
    queryKey: ["memories"],
    queryFn: fetchMemories,
    staleTime: 30_000,
  });

  return (
    <Screen>
      <ScreenHeader
        title="Memories"
        subtitle={`${memories.length} moment${memories.length !== 1 ? "s" : ""} saved`}
        action={
          <button
            aria-label="Add memory"
            onClick={() => setShowUpload(true)}
            className="gradient-love shadow-glow flex size-11 items-center justify-center rounded-2xl text-primary-foreground transition-transform active:scale-90"
          >
            <Plus className="size-5" />
          </button>
        }
      />

      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading memories…</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="text-4xl">😔</span>
          <p className="text-sm text-muted-foreground">Couldn't load memories. Check your connection.</p>
        </div>
      )}

      {!isLoading && !isError && memories.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="text-5xl">📸</span>
          <p className="font-semibold text-foreground">No memories yet</p>
          <p className="text-sm text-muted-foreground">
            Tap <strong>+</strong> to add your first beautiful moment together ❤️
          </p>
        </div>
      )}

      {!isLoading && memories.length > 0 && (
        <div className="columns-2 gap-3 [column-fill:_balance]">
          {memories.map((m, i) => (
            <MemoryCard key={m.id} m={m} index={i} />
          ))}
        </div>
      )}

      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
    </Screen>
  );
}
