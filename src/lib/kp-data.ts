import mem1 from "@/assets/mem1.jpg";
import mem2 from "@/assets/mem2.jpg";
import mem3 from "@/assets/mem3.jpg";
import himAvatar from "@/Logo_Photo/2.jpeg";
import herAvatar from "@/Logo_Photo/1.jpg";

export { himAvatar, herAvatar };

export const START_DATE = new Date("2022-02-14T00:00:00Z");

export function daysTogether() {
  return Math.floor((Date.now() - START_DATE.getTime()) / 86_400_000);
}

export const HIM = { name: "Kashish Shrestha", short: "Kashish", role: "Boyfriend", initials: "KS", avatar: himAvatar };
export const HER = { name: "Preshna GC", short: "Preshna", role: "Girlfriend", initials: "PG", avatar: herAvatar };

export type Memory = {
  id: string;
  image: string;
  caption: string;
  date: string;
  location: string;
  favorite: boolean;
  span: "tall" | "short";
};

export const MEMORIES: Memory[] = [
  {
    id: "morning-coffee",
    image: mem1,
    caption: "Slow morning, two cups, one us",
    date: "14 Feb 2026",
    location: "Lazimpat, Kathmandu",
    favorite: true,
    span: "tall",
  },
  {
    id: "sunrise-hike",
    image: mem2,
    caption: "You said the hills looked like watercolor",
    date: "02 Jan 2026",
    location: "Nagarkot Viewpoint",
    favorite: false,
    span: "short",
  },
  {
    id: "rooftop-dinner",
    image: mem3,
    caption: "String lights and your laugh",
    date: "18 Dec 2025",
    location: "Thamel Rooftop",
    favorite: true,
    span: "tall",
  },
];

export const NOTES = [
  {
    id: 1,
    title: "For rainy days",
    body: "If the day feels heavy, remember I am one call away. Always.",
    from: "Kashish",
    date: "Today",
    tone: "pink",
  },
  {
    id: 2,
    title: "Thank you",
    body: "For the tea at 2am while I studied. You are my calm.",
    from: "Preshna",
    date: "Yesterday",
    tone: "lavender",
  },
  {
    id: 3,
    title: "Little promise",
    body: "Next winter, the mountains again — same jacket, same you.",
    from: "Kashish",
    date: "3 days ago",
    tone: "gold",
  },
  {
    id: 4,
    title: "Just because",
    body: "I smiled at nothing today and then realized it was you.",
    from: "Preshna",
    date: "Last week",
    tone: "coral",
  },
];

export const EVENTS = [
  { day: 14, label: "Anniversary", emoji: "❤️", note: "4 years together" },
  { day: 3, label: "Preshna's Birthday", emoji: "🎂", note: "Plan the surprise" },
  { day: 22, label: "Movie Night", emoji: "🎬", note: "Her pick this time" },
  { day: 27, label: "Kashish's Birthday", emoji: "🎈", note: "Cake at midnight" },
];

export const PLAYLIST = [
  { title: "Golden Hour", artist: "JVKE", len: "3:29" },
  { title: "Until I Found You", artist: "Stephen Sanchez", len: "2:56" },
  { title: "Perfect", artist: "Ed Sheeran", len: "4:23" },
  { title: "Tum Hi Ho", artist: "Arijit Singh", len: "4:22" },
  { title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", len: "4:11" },
];

export const NOTIFICATIONS = [
  { icon: "❤️", title: "Preshna arrived home", time: "8:42 PM", tone: "primary" },
  { icon: "📍", title: "Kashish updated location", time: "8:10 PM", tone: "lavender" },
  { icon: "💌", title: "New love note: “For rainy days”", time: "6:35 PM", tone: "gold" },
  { icon: "📸", title: "New memory added to Rooftop", time: "Yesterday", tone: "coral" },
  { icon: "📅", title: "Anniversary in 12 days", time: "Yesterday", tone: "primary" },
];

export const MESSAGES = [
  { id: 1, from: "her", text: "Did you eat? Don't skip lunch again 🙂", time: "7:02 PM" },
  { id: 2, from: "him", text: "I did! Dal bhat, as ordered ❤️", time: "7:03 PM" },
  { id: 3, from: "her", text: "Good boy. I miss you though.", time: "7:03 PM", reaction: "❤️" },
  { id: 4, from: "him", text: "12 km away. Give me 20 minutes and a scooter.", time: "7:05 PM" },
  { id: 5, from: "her", text: "Bring momo. And yourself. Mostly yourself.", time: "7:06 PM" },
];
