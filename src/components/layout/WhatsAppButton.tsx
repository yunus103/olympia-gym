"use client";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export function WhatsAppButton({ number }: { number: string }) {
  const cleanNumber = number.replace(/\D/g, "");
  return (
    <motion.a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
      className="fixed bottom-4 right-4 z-30 flex size-12 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground md:bottom-6 md:right-6 md:size-14"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.3 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaWhatsapp className="size-6 md:size-7" />
    </motion.a>
  );
}
