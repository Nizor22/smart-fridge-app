// Dynamic expiration engine
// Auto-calculates expiry dates and urgency based on food category

const SHELF_LIFE_DAYS: Record<string, number> = {
  Dairy: 7,
  Meat: 3,
  Produce: 5,
  Pantry: 90,
  Beverage: 30,
  Other: 14,
};

export type UrgencyLevel = 'EAT_NOW' | 'USE_SOON' | 'FRESH';

export function getShelfLifeDays(category: string): number {
  return SHELF_LIFE_DAYS[category] || SHELF_LIFE_DAYS.Other;
}

export function calculateExpiryDate(category: string, addedAt?: string): string {
  const base = addedAt ? new Date(addedAt) : new Date();
  const days = getShelfLifeDays(category);
  const expiry = new Date(base);
  expiry.setDate(expiry.getDate() + days);
  return expiry.toISOString();
}

export function getDaysRemaining(expiresAt: string): number {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calculateUrgency(expiresAt: string): UrgencyLevel {
  const days = getDaysRemaining(expiresAt);
  if (days <= 2) return 'EAT_NOW';
  if (days <= 5) return 'USE_SOON';
  return 'FRESH';
}

export function getUrgencyFromItem(item: { category: string; created_at?: string; expires_at?: string }): { urgency: UrgencyLevel; daysLeft: number; expiresAt: string } {
  const expiresAt = item.expires_at || calculateExpiryDate(item.category, item.created_at);
  const daysLeft = getDaysRemaining(expiresAt);
  const urgency = calculateUrgency(expiresAt);
  return { urgency, daysLeft, expiresAt };
}
