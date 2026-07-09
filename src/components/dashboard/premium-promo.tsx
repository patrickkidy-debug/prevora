"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Clock, ShieldCheck, ArrowRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function PremiumPromo({
  trialExpiresAt,
  isPremium,
  premiumExpiresAt,
}: {
  trialExpiresAt: Date | null;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
}) {
  const [timeLeft, setTimeLeft] = React.useState<string | null>(null);
  const [trialExpired, setTrialExpired] = React.useState(false);

  React.useEffect(() => {
    if (!trialExpiresAt || isPremium) return;

    const calculateTime = () => {
      const expiry = new Date(trialExpiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTrialExpired(true);
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(" "));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [trialExpiresAt, isPremium]);

  if (isPremium) {
    return null;
  }

  // Active free trial banner/card
  if (trialExpiresAt && !trialExpired && timeLeft) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Star className="size-24 text-primary animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary/20 text-primary">
                <Clock className="size-4 animate-pulse" />
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  Période d&apos;essai Premium en cours
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    1.5h Gratuit
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Toutes les fonctionnalités premium sont débloquées. Temps restant :{" "}
                  <strong className="text-primary font-mono">{timeLeft}</strong>
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/95 text-white gap-1 shrink-0">
              <Link href="/subscription">
                S&apos;abonner (Offre Standard) <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Trial expired or basic account CTA card
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="border-border bg-gradient-to-r from-secondary/50 to-secondary/10 relative overflow-hidden shadow-sm">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 mt-1">
              <Sparkles className="size-4" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Passez à l&apos;offre Standard Prevora</p>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Obtenez des résumés IA quotidiens, des bilans exportables en PDF, des alertes de constantes personnalisées et plus encore pour seulement <strong>3 500 FCFA / mois</strong>.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/95 text-white gap-1 shrink-0">
            <Link href="/subscription">
              Débloquer l&apos;offre Standard <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
