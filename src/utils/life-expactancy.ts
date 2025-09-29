const lifeExpectancyData: Record<string, number> = {
  Ukraine: 72,
  "United States": 79,
  Germany: 81,
  Japan: 85,
  "United Kingdom": 81,
};

export const calculateLifeExpectancy = (
  dateOfBirth: Date,
  country: string
): number => {
  const baseLifeExpectancy = lifeExpectancyData[country] || 75;

  const currentAge = Math.floor(
    (new Date().getTime() - dateOfBirth.getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );

  if (currentAge < 30) {
    return baseLifeExpectancy + 2;
  } else if (currentAge < 50) {
    return baseLifeExpectancy + 1;
  }

  return baseLifeExpectancy;
};
