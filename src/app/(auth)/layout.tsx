import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MEDICAL_DISCLAIMER } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-secondary)_0%,transparent_70%)] opacity-70"
      />
      <header className="flex items-center justify-between p-4 sm:p-6">
        <Link href="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="mx-auto max-w-md px-6 pb-8 text-center text-xs text-muted-foreground">
        {MEDICAL_DISCLAIMER}
      </footer>
    </div>
  );
}
