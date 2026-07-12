"use client";

import { usePathname } from "next/navigation";

/**
 * Lightweight page transition: a CSS fade-in re-triggered on route change.
 * No framer-motion / AnimatePresence exit delay — content appears as soon as
 * the server segment is ready, so navigation feels instant.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div
      key={pathname}
      className="flex w-full flex-1 flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
    >
      {children}
    </div>
  );
}
