"use client";

import Link from "next/link";
import { ComponentProps, MouseEvent } from "react";

type HashLinkProps = ComponentProps<typeof Link>;

// In-page anchor link that always scrolls, even when the URL hash is unchanged.
// Browsers only scroll on a hash *change*, so we scroll ourselves and update the
// URL silently via replaceState. Falls back to normal Link behavior when the
// target is not on the current page.
export function HashLink({ href, onClick, ...rest }: HashLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (typeof href !== "string" || !href.startsWith("#")) return;
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", href);
  };

  return <Link href={href} prefetch={false} onClick={handleClick} {...rest} />;
}
