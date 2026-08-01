import { createFileRoute } from "@tanstack/react-router";
import { Screen, ScreenHeader } from "@/components/kp/Shell";
import { EVENTS } from "@/lib/kp-data";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — K&P Love" },
      { name: "description", content: "Anniversaries, birthdays and countdowns to your next moment together." },
      { property: "og:title", content: "Calendar — K&P Love" },
      { property: "og:description", content: "Anniversaries, birthdays and countdowns." },
    ],
  }),
  component: CalendarScreen,
});

function CalendarScreen() {
  const now = new Date();
  const month = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const marked = new Map(EVENTS.map((e) => [e.day, e]));

  return (
    <Screen fab>
      <ScreenHeader title="Our Calendar" subtitle={month} />

      <section className="glass animate-rise rounded-3xl p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="py-1">
              {d}
            </span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const event = d ? marked.get(d) : undefined;
            const today = d === now.getDate();
            return (
              <div
                key={i}
                className={`relative flex aspect-square items-center justify-center rounded-2xl text-sm transition-colors ${
                  today
                    ? "gradient-love font-semibold text-primary-foreground"
                    : event
                      ? "bg-primary/12 font-medium text-primary"
                      : "text-foreground/80"
                }`}
              >
                {d}
                {event && !today && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <h2 className="mt-6 mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Upcoming
      </h2>
      <div className="space-y-3">
        {EVENTS.map((e, i) => (
          <div
            key={e.label}
            style={{ animationDelay: `${i * 60}ms` }}
            className="glass animate-rise flex items-center gap-3 rounded-3xl p-4"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-xl">
              {e.emoji}
            </span>
            <div className="flex-1">
              <p className="font-medium">{e.label}</p>
              <p className="text-xs text-muted-foreground">{e.note}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-primary">{e.day}</p>
              <p className="text-[11px] text-muted-foreground">
                {now.toLocaleDateString(undefined, { month: "short" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
