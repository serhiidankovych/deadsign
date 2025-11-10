export const isNewDay = (timestamp1: number, timestamp2: number): boolean => {
  const date1 = new Date(timestamp1).toDateString();
  const date2 = new Date(timestamp2).toDateString();
  return date1 !== date2;
};
