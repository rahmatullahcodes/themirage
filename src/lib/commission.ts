/**
 * The Mirage - Unified Commission Calculation Engine
 * 
 * Standard Split:
 * - Creator: 85%
 * - Platform: 15%
 * 
 * Configurable via environment variables or database PlatformSetting records.
 */

export interface CommissionBreakdown {
  grossAmount: number;
  creatorShare: number;
  platformShare: number;
  feeAmount: number;
  netPayout: number;
  creatorPercent: number;
  platformPercent: number;
}

export function calculateCommission(
  grossAmount: number,
  customCreatorPercent?: number,
  customFeeAmount: number = 0.0
): CommissionBreakdown {
  const creatorPercent = customCreatorPercent ?? 
    (process.env.CREATOR_COMMISSION_PERCENT ? parseFloat(process.env.CREATOR_COMMISSION_PERCENT) : 85);
  const platformPercent = 100 - creatorPercent;

  // Amount after gateway processing fee (if applicable)
  const taxableBase = Math.max(0, grossAmount - customFeeAmount);

  const creatorShare = parseFloat(((taxableBase * creatorPercent) / 100).toFixed(2));
  const platformShare = parseFloat((taxableBase - creatorShare).toFixed(2));

  return {
    grossAmount: parseFloat(grossAmount.toFixed(2)),
    creatorShare,
    platformShare,
    feeAmount: parseFloat(customFeeAmount.toFixed(2)),
    netPayout: creatorShare,
    creatorPercent,
    platformPercent,
  };
}

