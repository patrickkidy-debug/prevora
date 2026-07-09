"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

// Primary destinations for the mobile bottom bar.
const items = [
  { href: "/dashboard", label: "Accueil", icon: "layout-dashboard" },
  { href: "/questionnaire", label: "Suivi", icon: "clipboard-list" },
  { href: "/history", label: "Historique", icon: "calendar-days" },
  { href: "/reports", label: "Rapports", icon: "file-text" },
  { href: "/profile", label: "Profil", icon: "user" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-lg lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon name={item.icon} className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
