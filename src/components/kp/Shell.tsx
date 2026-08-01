import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MapPin, MessageCircle, Images, User, Heart, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TABS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/map", label: "Map", icon: MapPin },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/memories", label: "Memories", icon: Images },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-4">
      <div className="glass pointer-events-auto flex w-[min(24rem,calc(100%-2rem))] items-center justify-between rounded-3xl px-2 py-2">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={cn(
                "relative flex min-h-11 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 transition-all duration-300 active:scale-95",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute inset-0 -z-10 rounded-2xl bg-primary/10 animate-rise" />
              )}
              <Icon className={cn("size-5 transition-transform", active && "scale-110")} strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function FloatingHeart({ to = "/notes" }: { to?: string }) {
  return (
    <Link
      to={to}
      aria-label="Write a love note"
      className="gradient-love shadow-glow fixed bottom-24 right-5 z-40 flex size-14 items-center justify-center rounded-full text-primary-foreground transition-transform duration-300 hover:scale-105 active:scale-90"
    >
      <Heart className="size-6 animate-heart" fill="currentColor" />
    </Link>
  );
}

export function Screen({
  children,
  className,
  nav = true,
  fab = false,
}: {
  children: ReactNode;
  className?: string;
  nav?: boolean;
  fab?: boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(120%_100%_at_20%_0%,color-mix(in_oklab,var(--primary-soft)_45%,transparent),transparent_70%)]"
      />
      <div className={cn("relative mx-auto w-full max-w-md px-5 pt-6", nav ? "pb-32" : "pb-8", className)}>
        {children}
      </div>
      {fab && <FloatingHeart />}
      {nav && <BottomNav />}
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="animate-rise mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
