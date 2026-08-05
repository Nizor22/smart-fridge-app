export class GamificationEngine {
  static calculateImpact(consumedCount: number, streakDays: number) {
    return {
      dollarsSaved: consumedCount * 3.50,
      co2SavedKg: consumedCount * 0.85,
      streakDays,
      badge: streakDays >= 7 ? '7-Day Zero Waste Hero' : 'Beginner',
    };
  }
}
