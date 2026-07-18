/**
 * Helper utilities for blood donation interval calculation & medical eligibility rules.
 */

export function getRequiredIntervalDays(gender?: string | null): number {
  if (gender === 'female') {
    return 120 // ~4 months for females
  }
  return 90 // ~3 months for males / standard
}

export function getDaysSinceDonation(lastDonationDate?: string | null): number | null {
  if (!lastDonationDate) return null
  const last = new Date(lastDonationDate)
  if (isNaN(last.getTime())) return null

  const today = new Date()
  last.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - last.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export interface CooldownStatus {
  isEligible: boolean
  daysSince: number | null
  requiredDays: number
  daysRemaining: number
  nextEligibleDateStr: string | null
}

export function getCooldownStatus(
  lastDonationDate?: string | null,
  gender?: string | null
): CooldownStatus {
  const requiredDays = getRequiredIntervalDays(gender)
  const daysSince = getDaysSinceDonation(lastDonationDate)

  if (daysSince === null) {
    return {
      isEligible: true,
      daysSince: null,
      requiredDays,
      daysRemaining: 0,
      nextEligibleDateStr: null,
    }
  }

  if (daysSince >= requiredDays) {
    return {
      isEligible: true,
      daysSince,
      requiredDays,
      daysRemaining: 0,
      nextEligibleDateStr: null,
    }
  }

  const daysRemaining = requiredDays - daysSince
  const last = new Date(lastDonationDate!)
  const nextDate = new Date(last)
  nextDate.setDate(nextDate.getDate() + requiredDays)

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
  const nextEligibleDateStr = nextDate.toLocaleDateString('en-US', options)

  return {
    isEligible: false,
    daysSince,
    requiredDays,
    daysRemaining,
    nextEligibleDateStr,
  }
}
