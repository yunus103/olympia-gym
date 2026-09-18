"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { RiCloseLine } from "react-icons/ri";
import { Announcement } from "@/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "announcement-dismissed";
const CHANGE_EVENT = "announcement-dismissed-change";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(CHANGE_EVENT, cb);
  };
}

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function dismiss(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Date filtering runs here, not in GROQ: the page is ISR-cached, so a server-side
// filter would keep an expired announcement on screen until the next revalidation.
function pickActive(items: Announcement[], now: number) {
  return items.find((a) => {
    const starts = a.startsAt ? Date.parse(a.startsAt) : -Infinity;
    const ends = a.endsAt ? Date.parse(a.endsAt) : Infinity;
    return starts <= now && now <= ends;
  });
}

export function AnnouncementBar({ items }: { items: Announcement[] }) {
  // Both the clock and localStorage live outside React, so they are read through one external-store snapshot.
  // The server has no localStorage, so nothing counts as dismissed there.
  const activeId = useSyncExternalStore(
    subscribe,
    () => {
      const id = pickActive(items, Date.now())?._id ?? "";
      return id && readDismissed() === id ? "" : id;
    },
    () => pickActive(items, Date.now())?._id ?? ""
  );
  const active = items.find((a) => a._id === activeId);

  // Slide in after the hero has had a moment; the toast must not compete with the scene loading overlay.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!active) return null;

  const content = active.link ? (
    <a href={active.link} className="underline underline-offset-2 hover:no-underline">
      {active.text}
    </a>
  ) : (
    <span>{active.text}</span>
  );

  return (
    <div
      role="status"
      className={cn(
        "chamfer fixed bottom-4 left-4 right-20 z-30 flex items-center gap-3 border border-border border-l-2 border-l-primary bg-card px-4 py-3 text-[13px] transition-[opacity,transform] duration-500 md:bottom-6 md:left-6 md:right-auto md:max-w-sm",
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <p className="min-w-0 flex-1">{content}</p>
      <button
        type="button"
        onClick={() => dismiss(active._id)}
        aria-label="Duyuruyu kapat"
        className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
      >
        <RiCloseLine size={16} />
      </button>
    </div>
  );
}
