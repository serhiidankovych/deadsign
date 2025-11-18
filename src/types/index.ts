export interface User {
  name: string;
  dateOfBirth: Date;
  country: string;
  lifeExpectancy: number;
  currentAge: number;
  weeksLived: number;
  totalWeeks: number;
  cacheVersion?: number;
}
