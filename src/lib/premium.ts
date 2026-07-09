export type PremiumStatus = {
  isPremium: boolean;
  reason: "suspended" | "subscription" | "trial" | "expired" | "none";
  expiresAt?: Date | null;
};

/**
 * Determine if a user has active premium access (either via subscription or active trial).
 */
export function getUserPremiumStatus(user: {
  suspended: boolean;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  trialExpiresAt: Date | null;
}): PremiumStatus {
  if (user.suspended) {
    return { isPremium: false, reason: "suspended" };
  }

  const now = new Date();

  // Active subscription
  if (user.isPremium) {
    if (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > now) {
      return {
        isPremium: true,
        reason: "subscription",
        expiresAt: user.premiumExpiresAt,
      };
    }
  }

  // Active trial
  if (user.trialExpiresAt && new Date(user.trialExpiresAt) > now) {
    return {
      isPremium: true,
      reason: "trial",
      expiresAt: user.trialExpiresAt,
    };
  }

  return {
    isPremium: false,
    reason: user.trialExpiresAt ? "expired" : "none",
    expiresAt: user.trialExpiresAt,
  };
}
