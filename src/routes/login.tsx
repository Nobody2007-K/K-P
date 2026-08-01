import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Lock, User } from "lucide-react";
import bg from "@/assets/romantic-bg.jpg";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — K&P Love" },
      { name: "description", content: "Sign in to your private K&P Love space." },
      { property: "og:title", content: "Sign in — K&P Love" },
      { property: "og:description", content: "Sign in to your private K&P Love space." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/home" }), 900);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <img
        src={bg}
        alt=""
        width={768}
        height={1536}
        className="absolute inset-0 size-full scale-110 object-cover blur-lg"
      />
      <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--plum)_45%,transparent)]" />

      <form
        onSubmit={submit}
        className="glass animate-rise relative w-full max-w-sm rounded-3xl p-7 text-primary-foreground"
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="gradient-love shadow-glow flex size-16 items-center justify-center rounded-2xl">
            <Heart className="size-7 animate-heart" fill="currentColor" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-center text-sm text-primary-foreground/80">
            Kashish &amp; Preshna — your world of two
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/70" />
            <Input
              defaultValue="kashish"
              aria-label="Username"
              placeholder="Username"
              className="h-12 rounded-2xl border-white/30 bg-white/15 pl-10 text-primary-foreground placeholder:text-primary-foreground/60"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/70" />
            <Input
              type="password"
              defaultValue="loveyou"
              aria-label="Password"
              placeholder="Password"
              className="h-12 rounded-2xl border-white/30 bg-white/15 pl-10 text-primary-foreground placeholder:text-primary-foreground/60"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Checkbox id="remember" defaultChecked className="border-white/50 data-[state=checked]:bg-primary" />
          <Label htmlFor="remember" className="text-sm text-primary-foreground/85">
            Remember me
          </Label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="gradient-love shadow-glow mt-6 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold tracking-wide text-primary-foreground transition-transform duration-200 active:scale-95 disabled:opacity-80"
        >
          {loading ? "Connecting hearts…" : "Enter our world"}
        </button>

        <p className="mt-5 text-center text-xs text-primary-foreground/70">
          Private app · No sign ups · Just us ❤️
        </p>
      </form>
    </main>
  );
}
