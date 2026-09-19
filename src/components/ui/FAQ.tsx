"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { JsonLd, faqPageJsonLd } from "@/components/seo/JsonLd";
import { cn } from "@/lib/utils";
import { Faq } from "@/types";

export function FAQ({ items, className }: { items: Faq[]; className?: string }) {
  const [activeKey, setActiveKey] = useState<string | null>(items[0]?._key ?? null);

  if (items.length === 0) return null;

  return (
    <>
      <JsonLd data={faqPageJsonLd(items)} />

      <div className={cn("border-t border-border", className)}>
        {items.map((item) => {
          const open = activeKey === item._key;
          const panelId = `faq-${item._key}`;
          return (
            <div key={item._key} className="border-b border-border">
              <button
                type="button"
                onClick={() => setActiveKey(open ? null : item._key)}
                aria-expanded={open}
                aria-controls={panelId}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="text-lg font-medium text-foreground transition-colors group-hover:text-primary">{item.question}</span>
                <Plus
                  aria-hidden
                  className={cn(
                    "size-5 shrink-0 transition-transform duration-300",
                    open ? "rotate-45 text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
              </button>

              {/* Answers stay in the DOM (crawlable); only height animates. */}
              <motion.div
                id={panelId}
                initial={false}
                animate={{ height: open ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="pb-5 pr-11 text-base leading-relaxed text-muted-foreground">{item.answer}</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </>
  );
}
