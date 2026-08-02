import himAvatar from "@/Logo_Photo/2.jpeg";
import herAvatar from "@/Logo_Photo/1.jpg";

export { himAvatar, herAvatar };

// ── Relationship start date ───────────────────────────────────────────────────
// Change this to the real date Kashish & Preshna got together
export const START_DATE = new Date("2024-08-13T00:00:00Z");

export function daysTogether() {
  return Math.floor((Date.now() - START_DATE.getTime()) / 86_400_000);
}

// ── User profiles ─────────────────────────────────────────────────────────────
export const HIM = {
  name: "Kashish Shrestha",
  short: "Kashish",
  role: "Boyfriend",
  initials: "KS",
  avatar: himAvatar,
};

export const HER = {
  name: "Preshna GC",
  short: "Preshna",
  role: "Girlfriend",
  initials: "PG",
  avatar: herAvatar,
};

// ── Types ─────────────────────────────────────────────────────────────────────
export type Memory = {
  id: string;
  image: string;
  caption: string;
  date: string;
  location: string;
  favorite: boolean;
  span: "tall" | "short";
};

// ── All data starts empty — add your own! ─────────────────────────────────────
export const MEMORIES: Memory[] = [];

export const NOTES: {
  id: number;
  title: string;
  body: string;
  from: string;
  date: string;
  tone: string;
}[] = [];

export const EVENTS: {
  day: number;
  label: string;
  emoji: string;
  note: string;
}[] = [];

export const PLAYLIST: {
  title: string;
  artist: string;
  len: string;
}[] = [];

export const NOTIFICATIONS: {
  icon: string;
  title: string;
  time: string;
  tone: string;
}[] = [];

export const MESSAGES: {
  id: number;
  from: string;
  text: string;
  time: string;
  reaction?: string;
}[] = [];
