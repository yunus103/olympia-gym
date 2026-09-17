"use client";

import { useSyncExternalStore } from "react";
import { RiCloseLine } from "react-icons/ri";
import { Announcement } from "@/types";

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

  if (!active) return null;

  const content = active.link ? (
    <a href={active.link} className="underline underline-offset-2 hover:no-underline">
      {active.text}
    </a>
  ) : (
    <span>{active.text}</span>
  );

  return (
    <div className="flex h-9 items-center bg-primary text-primary-foreground text-[13px]">
      <div className="container mx-auto flex items-center justify-center gap-3 px-4">
        <p className="truncate">{content}</p>
        <button
          type="button"
          onClick={() => dismiss(active._id)}
          aria-label="Duyuruyu kapat"
          className="ml-auto shrink-0 p-1 hover:opacity-70"
        >
          <RiCloseLine size={16} />
        </button>
      </div>
    </div>
  );
}
