"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { SanityImage } from "@/components/ui/SanityImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SanityImage as SanityImageType, NavItem } from "@/types";

export interface HeaderProps {
  siteName?: string;
  logo?: SanityImageType;
  links?: NavItem[];
  whatsappNumber?: string;
  whatsappLabel?: string;
  phone?: string;
  hoursLine?: string;
}

const SCROLLED_AT = 40;

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_AT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

// Highlights the nav link whose section currently occupies the upper part of the viewport.
function useActiveSection(links: NavItem[]) {
  const [active, setActive] = useState<string | null>(null);
  const ids = links.map((l) => l.href).filter((h) => h.startsWith("#")).join(",");

  useEffect(() => {
    const sections = ids
      .split(",")
      .filter(Boolean)
      .map((h) => document.getElementById(h.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function Header({ siteName, logo, links = [], whatsappNumber, whatsappLabel = "WhatsApp", phone, hoursLine }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();
  const activeHref = useActiveSection(links);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : undefined;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "relative w-full transition-colors duration-300",
          scrolled && "bg-background/80 backdrop-blur-md"
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-18">
          <Link href="/" prefetch={false} aria-label={siteName} className="flex h-full items-center py-3">
            {logo ? (
              <SanityImage
                image={logo}
                width={600}
                height={160}
                fit="max"
                sizes="240px"
                className="h-full w-auto object-contain object-left"
                priority
              />
            ) : (
              <span className="font-display text-2xl font-extrabold uppercase tracking-tight">{siteName}</span>
            )}
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Ana menü">
            {links.map((item) => {
              const isActive = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "relative py-1 font-display text-sm font-bold uppercase tracking-wide transition-colors hover:text-foreground",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary transition-transform duration-300 origin-left",
                      isActive ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </Link>
              );
            })}
            {whatsappHref && (
              <Button size="sm" render={<a href={whatsappHref} target="_blank" rel="noopener noreferrer" />}>
                <FaWhatsapp data-icon="inline-start" />
                {whatsappLabel}
              </Button>
            )}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Menüyü aç"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <RiMenu3Line className="size-6" />
          </Button>
        </div>

        {/* Amber LED line replaces the usual gray border once the header has a background */}
        <div
          aria-hidden
          className={cn("led-divider absolute inset-x-0 bottom-0 transition-opacity duration-300", scrolled ? "opacity-100" : "opacity-0")}
        />
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menü"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-background bg-honeycomb md:hidden"
          >
            <div className="container mx-auto flex h-16 items-center justify-end px-4">
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Menüyü kapat">
                <RiCloseLine className="size-6" />
              </Button>
            </div>

            <nav className="container mx-auto flex flex-1 flex-col justify-center gap-1 px-4" aria-label="Mobil menü">
              {links.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -24, opacity: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.25, ease: "easeOut" }}
                >
                  <Link
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-baseline gap-4 py-2"
                  >
                    <span className="font-display text-sm font-bold text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[2.75rem] font-extrabold uppercase leading-none tracking-tight">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="container mx-auto flex flex-col gap-4 px-4 pb-8">
              {whatsappHref && (
                <Button size="lg" className="w-full" render={<a href={whatsappHref} target="_blank" rel="noopener noreferrer" />}>
                  <FaWhatsapp data-icon="inline-start" />
                  {whatsappLabel}
                </Button>
              )}
              {(hoursLine || phone) && (
                <p className="flex flex-wrap gap-x-4 text-sm text-muted-foreground tabular-nums">
                  {hoursLine && <span>{hoursLine}</span>}
                  {phone && <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-foreground">{phone}</a>}
                </p>
              )}
            </div>

            <div aria-hidden className="led-divider" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
