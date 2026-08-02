import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Lock, User, AlertCircle } from "lucide-react";
import bg from "@/assets/romantic-bg.jpg";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HIM, HER } from "@/lib/kp-data";
import { attemptLogin } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — K&P Love" },
      { name: "description", content: "Sign in to your private K&P Love space." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // Determine which user is being previewed based on typed username
  const previewUser =
    username.toLowerCase() === "kashish" ? HIM :
    username.toLowerCase() === "preshna" ? HER :
    null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    // Strict: only Kashish and Preshna can log in — exact usernames
    const result = attemptLogin(username.trim(), password);
    if (!result) {
      setError("Invalid username or password. Only Kashish and Preshna can access this app.");
      return;
    }

    setLoading(true);
    // Navigate to the correct home view
    setTimeout(() => navigate({ to: "/home" }), 800);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Background */}
      <img
        src={bg}
        alt=""
        width={768}
        height={1536}
        className="absolute inset-0 size-full scale-110 object-cover blur-lg"
      />
      <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--plum)_68%,transparent)]" />

      <div className="relative w-full max-w-sm space-y-4">

        {/* ── Who are you? selector ───────────────────────────────────── */}
        <div className="animate-rise flex gap-3">
          <UserCard
            person={HIM}
            active={previewUser?.short === HIM.short}
            onClick={() => { setUsername("Kashish"); setError(""); }}
          />
          <UserCard
            person={HER}
            active={previewUser?.short === HER.short}
            onClick={() => { setUsername("Preshna"); setError(""); }}
          />
        </div>

        {/* ── Login form ──────────────────────────────────────────────── */}
        <form
          onSubmit={submit}
          className="glass-dark animate-rise rounded-3xl bg-[color-mix(in_oklab,oklch(0.2_0.03_300)_55%,transparent)] p-7 text-primary-foreground"
          style={{ animationDelay: "60ms" }}
        >
          {/* Header */}
          <div className="mb-6 flex flex-col items-center">
            <div className="gradient-love shadow-glow flex size-14 items-center justify-center rounded-2xl">
              <Heart className="size-6 animate-heart" fill="currentColor" />
            </div>
            <h1 className="mt-3 text-2xl font-semibold">
              {previewUser ? `Welcome, ${previewUser.short} ❤️` : "Welcome back"}
            </h1>
            <p className="mt-1 text-center text-xs text-primary-foreground/70">
              {previewUser
                ? previewUser.role === "Boyfriend"
                  ? "Logging in as Kashish — Boyfriend 💙"
                  : "Logging in as Preshna — Girlfriend 💗"
                : "Select your name above to continue"}
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/70" />
              <Input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                aria-label="Username"
                placeholder="Username (Kashish or Preshna)"
                autoComplete="username"
                className="h-12 rounded-2xl border-white/30 bg-white/15 pl-10 text-primary-foreground placeholder:text-primary-foreground/50"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/70" />
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                aria-label="Password"
                placeholder="Password"
                autoComplete="current-password"
                className="h-12 rounded-2xl border-white/30 bg-white/15 pl-10 text-primary-foreground placeholder:text-primary-foreground/50"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-2xl bg-red-500/20 px-3 py-2 text-xs text-red-200">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Remember me */}
          <div className="mt-4 flex items-center gap-2">
            <Checkbox
              id="remember"
              defaultChecked
              className="border-white/50 data-[state=checked]:bg-primary"
            />
            <Label htmlFor="remember" className="text-sm text-primary-foreground/85">
              Keep me signed in
            </Label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="gradient-love shadow-glow mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-wide text-primary-foreground transition-transform duration-200 active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Connecting hearts…
              </>
            ) : (
              "Enter our world ❤️"
            )}
          </button>

          <p className="mt-4 text-center text-[11px] text-primary-foreground/50">
            Private app · No sign ups · Only Kashish &amp; Preshna
          </p>
        </form>
      </div>
    </main>
  );
}

/** Clickable user card above the form */
function UserCard({
  person,
  active,
  onClick,
}: {
  person: typeof HIM | typeof HER;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-1 flex-col items-center gap-2 rounded-3xl p-4 transition-all duration-300
        ${active
          ? "bg-white/25 ring-2 ring-white/60 scale-[1.03]"
          : "bg-white/10 ring-1 ring-white/20 hover:bg-white/15"}
      `}
    >
      <img
        src={person.avatar}
        alt={person.short}
        width={96}
        height={96}
        className={`size-16 rounded-2xl object-cover transition-all duration-300 ${
          active ? "ring-4 ring-primary shadow-glow" : "ring-2 ring-white/30"
        }`}
      />
      <div className="text-center">
        <p className="text-sm font-semibold text-primary-foreground">{person.short}</p>
        <p className={`text-[10px] ${active ? "text-primary-foreground/90" : "text-primary-foreground/60"}`}>
          {person.role}
        </p>
      </div>
      {active && (
        <span className="rounded-full bg-primary/80 px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
          ✓ Selected
        </span>
      )}
    </button>
  );
}
