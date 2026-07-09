import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { OfflineSync } from "@/components/pwa/offline-sync";
import { MEDICAL_DISCLAIMER } from "@/config/site";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-sidebar p-4 lg:flex">
        <Link href="/dashboard" className="px-2 py-1.5">
          <Logo />
        </Link>
        <div className="mt-6 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <p className="px-2 pt-4 text-[0.65rem] leading-tight text-muted-foreground">
          {MEDICAL_DISCLAIMER}
        </p>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
          <div className="flex items-center gap-2">
            <MobileSidebar />
            <Link href="/dashboard" className="lg:hidden">
              <Logo showText={false} />
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <UserMenu
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
            />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          {children}
        </main>
      </div>

      <MobileNav />
      <OfflineSync />
    </div>
  );
}
