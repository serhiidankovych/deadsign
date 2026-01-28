export const LIFE_CONSTANTS = {
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  DAYS_PER_YEAR: 365.25,
  WEEKS_PER_YEAR: 52,
  MAX_AGE: 120,
  MIN_LIFESPAN_YEARS: 1,
  DEFAULT_EXPECTANCY: 80,
};

/**
 * UTILITY: Date Calculations
 */

export const calculateAge = (dateOfBirth: Date): number => {
  const diffMs = new Date().getTime() - dateOfBirth.getTime();
  return Math.floor(
    diffMs / (LIFE_CONSTANTS.MS_PER_DAY * LIFE_CONSTANTS.DAYS_PER_YEAR),
  );
};

export const calculateYearsBetween = (
  startDate: Date,
  endDate: Date,
): number => {
  if (endDate < startDate) return 0;
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.floor(
    diffMs / (LIFE_CONSTANTS.MS_PER_DAY * LIFE_CONSTANTS.DAYS_PER_YEAR),
  );
};

export const calculateWeeksLived = (dateOfBirth: Date): number => {
  const diffMs = new Date().getTime() - dateOfBirth.getTime();
  return Math.floor(diffMs / (LIFE_CONSTANTS.MS_PER_DAY * 7));
};

export const calculateTotalWeeksInLife = (
  lifeExpectancyInYears: number,
): number => {
  return Math.floor(lifeExpectancyInYears * LIFE_CONSTANTS.WEEKS_PER_YEAR);
};

export const calculateLifePercentage = (
  weeksLived: number,
  totalWeeks: number,
): number => {
  if (totalWeeks === 0) return 0;
  return (weeksLived / totalWeeks) * 100;
};

export const getExpectedDeathDate = (
  dateOfBirth: Date,
  lifeExpectancy: number,
): Date => {
  const deathDate = new Date(dateOfBirth);
  deathDate.setFullYear(deathDate.getFullYear() + lifeExpectancy);
  return deathDate;
};

/**
 * UTILITY: Validation
 */

export const isValidAge = (dateOfBirth: Date): boolean => {
  const age = calculateAge(dateOfBirth);
  return age >= 0 && age <= LIFE_CONSTANTS.MAX_AGE;
};

export const isValidManualDeathDate = (
  birthDate: Date,
  deathDate: Date,
): boolean => {
  const ageInYears = calculateYearsBetween(birthDate, deathDate);
  return (
    ageInYears >= LIFE_CONSTANTS.MIN_LIFESPAN_YEARS &&
    ageInYears <= LIFE_CONSTANTS.MAX_AGE
  );
};

/**
 * UTILITY: Formatting & UI Helpers
 */

export const getYearLabel = (count: number): string => {
  return count === 1 ? "year" : "years";
};

export const getAgeLabel = (date: Date): string => {
  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  let months = now.getMonth() - date.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < date.getDate())) {
    years--;
    months += 12;
  }

  if (years <= 0) {
    if (months <= 0) return "less than 1 month old";
    return `${months} month${months > 1 ? "s" : ""} old`;
  }

  return `${years} ${getYearLabel(years)} old`;
};

export const getLifeDateBounds = (dateOfBirth: Date) => {
  const minDate = new Date(dateOfBirth.getTime() + LIFE_CONSTANTS.MS_PER_DAY);

  const maxDate = getExpectedDeathDate(dateOfBirth, LIFE_CONSTANTS.MAX_AGE);

  const defaultDeathDate = getExpectedDeathDate(
    dateOfBirth,
    LIFE_CONSTANTS.DEFAULT_EXPECTANCY,
  );

  return { minDate, maxDate, defaultDeathDate };
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
