import { useMemo } from "react";

export const useCurrentWeekProgress = (): number => {
  return useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const secondsInDay = 24 * 60 * 60;
    const secondsPassedToday = (today.getTime() - startOfDay.getTime()) / 1000;

    const dailyProgress = secondsPassedToday / secondsInDay;

    const dayOfWeek = today.getDay();
    const startOfWeekDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return (startOfWeekDayIndex + dailyProgress) / 7;
  }, []);
};
