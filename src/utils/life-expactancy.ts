export const countryLifeExpectancy: Record<string, number> = {
  Ukraine: 72,
  "United States": 79,
  Germany: 81,
  Japan: 85,
  "United Kingdom": 81,
};

export function calculateLifeExpectancy(dateOfBirth: Date, country: string) {
  const baseLife = countryLifeExpectancy[country] ?? 75;
  return baseLife;
}
