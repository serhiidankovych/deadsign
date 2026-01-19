const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_YEAR = 365.25;
const WEEKS_PER_YEAR = 52;

export const calculateAge = (dateOfBirth: Date): number => {
  const diffMs = new Date().getTime() - dateOfBirth.getTime();
  return Math.floor(diffMs / (MS_PER_DAY * DAYS_PER_YEAR));
};

export const calculateWeeksLived = (dateOfBirth: Date): number => {
  const diffMs = new Date().getTime() - dateOfBirth.getTime();
  return Math.floor(diffMs / (MS_PER_DAY * 7));
};

export const calculateTotalWeeksInLife = (
  lifeExpectancyInYears: number,
): number => {
  return lifeExpectancyInYears * WEEKS_PER_YEAR;
};

export const calculateLifePercentage = (
  weeksLived: number,
  totalWeeks: number,
): number => {
  if (totalWeeks === 0) return 0;
  return (weeksLived / totalWeeks) * 100;
};

export const getUserLifeStats = (dateOfBirth: Date, lifeExpectancy: number) => {
  const age = calculateAge(dateOfBirth);
  const weeksLived = calculateWeeksLived(dateOfBirth);
  const totalWeeks = calculateTotalWeeksInLife(lifeExpectancy);
  const remainingWeeks = totalWeeks - weeksLived;
  const lifeProgress = calculateLifePercentage(weeksLived, totalWeeks);

  return {
    age,
    weeksLived,
    totalWeeks,
    remainingWeeks,
    lifeProgress,
  };
};
