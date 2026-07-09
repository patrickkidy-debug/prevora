export type SubscriptionTier = "FREE" | "ESSENTIAL" | "STANDARD" | "PREMIUM";

export type PremiumStatus = {
  isPremium: boolean; // True if they have ANY active subscription or active trial
  tier: SubscriptionTier;
  reason: "suspended" | "subscription" | "trial" | "expired" | "none";
  expiresAt?: Date | null;
};

/**
 * Determine if a user has active premium access (either via subscription or active trial)
 * and return their active subscription tier.
 */
export function getUserPremiumStatus(user: {
  suspended: boolean;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  trialExpiresAt: Date | null;
  subscriptionTier?: string; // Tiers: "FREE", "ESSENTIAL", "STANDARD", "PREMIUM"
}): PremiumStatus {
  if (user.suspended) {
    return { isPremium: false, tier: "FREE", reason: "suspended" };
  }

  const now = new Date();

  // 1. Active free trial: grants full PREMIUM tier access
  if (user.trialExpiresAt && new Date(user.trialExpiresAt) > now) {
    return {
      isPremium: true,
      tier: "PREMIUM",
      reason: "trial",
      expiresAt: user.trialExpiresAt,
    };
  }

  // 2. Active paid subscription
  if (user.isPremium) {
    if (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > now) {
      const activeTier = (user.subscriptionTier || "STANDARD") as SubscriptionTier;
      return {
        isPremium: true,
        tier: activeTier,
        reason: "subscription",
        expiresAt: user.premiumExpiresAt,
      };
    }
  }

  // 3. Expired or free account
  return {
    isPremium: false,
    tier: "FREE",
    reason: user.trialExpiresAt ? "expired" : "none",
    expiresAt: user.trialExpiresAt,
  };
}

/** Check if the user's tier has access to advanced AI summaries */
export function hasAiAccess(tier: SubscriptionTier): boolean {
  return tier === "STANDARD" || tier === "PREMIUM";
}

/** Check if the user's tier has access to PDF reports */
export function hasReportsAccess(tier: SubscriptionTier): boolean {
  return tier === "STANDARD" || tier === "PREMIUM";
}

/** Check if the user's tier has access to predictions */
export function hasPredictionsAccess(tier: SubscriptionTier): boolean {
  return tier === "PREMIUM";
}

/** Check if history is unlimited (more than 7 days) */
export function hasUnlimitedHistoryAccess(tier: SubscriptionTier): boolean {
  return tier !== "FREE" && tier !== "ESSENTIAL";
}
