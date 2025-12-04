import { Colors } from "@/src/constants/colors";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { SQUARE_SIZE, SQUARE_SPACING, WEEKS_PER_ROW } from "../constants";
import type { User } from "../types";

interface WeeksRendererProps {
  user: User;
}

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

const WeekRow = React.memo<{
  rowIndex: number;
  startWeek: number;
  endWeek: number;
  weeksLived: number;
  currentWeekProgress: number;
}>(({ rowIndex, startWeek, endWeek, weeksLived, currentWeekProgress }) => {
  const y = rowIndex * (SQUARE_SIZE + SQUARE_SPACING);

  const weeks = useMemo(() => {
    const result = [];

    for (let weekIndex = startWeek; weekIndex <= endWeek; weekIndex++) {
      const col = weekIndex % WEEKS_PER_ROW;
      const x = col * (SQUARE_SIZE + SQUARE_SPACING);
      const isLived = weekIndex < weeksLived;
      const isCurrentWeek = weekIndex === weeksLived;

      let color: string = Colors.lifeFuture;
      let width = SQUARE_SIZE;
      let showBorder = false;

      if (isCurrentWeek) {
        color = Colors.lifeCurrent;
        width = SQUARE_SIZE * currentWeekProgress;
        showBorder = true;
      } else if (isLived) {
        color = Colors.lifePast;
      }

      result.push(
        <View
          key={weekIndex}
          style={[
            styles.week,
            {
              left: x,
              width: width,
              height: SQUARE_SIZE,
              backgroundColor: color,
            },
          ]}
        />
      );

      if (showBorder) {
        result.push(
          <View
            key={`border-${weekIndex}`}
            style={[
              styles.weekBorder,
              {
                left: x,
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                borderColor: Colors.lifeCurrent,
              },
            ]}
          />
        );
      }
    }
    return result;
  }, [startWeek, endWeek, weeksLived, currentWeekProgress]);

  return (
    <View style={[styles.row, { top: y, height: SQUARE_SIZE }]}>{weeks}</View>
  );
});

WeekRow.displayName = "WeekRow";

export const WeeksRenderer = React.memo<WeeksRendererProps>(
  ({ user }) => {
    const currentWeekProgress = useCurrentWeekProgress();

    const rows = useMemo(() => {
      const totalRows = Math.ceil(user.totalWeeks / WEEKS_PER_ROW);
      const rowComponents = [];

      for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
        const startWeek = rowIndex * WEEKS_PER_ROW;
        const endWeek = Math.min(
          startWeek + WEEKS_PER_ROW - 1,
          user.totalWeeks - 1
        );

        rowComponents.push(
          <WeekRow
            key={rowIndex}
            rowIndex={rowIndex}
            startWeek={startWeek}
            endWeek={endWeek}
            weeksLived={user.weeksLived}
            currentWeekProgress={currentWeekProgress}
          />
        );
      }

      console.log(`Rendered ${totalRows} rows for ${user.totalWeeks} weeks`);
      return rowComponents;
    }, [user.weeksLived, user.totalWeeks, currentWeekProgress]);

    return <View style={styles.container}>{rows}</View>;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.user.weeksLived === nextProps.user.weeksLived &&
      prevProps.user.totalWeeks === nextProps.user.totalWeeks
    );
  }
);

WeeksRenderer.displayName = "WeeksRenderer";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  row: {
    position: "absolute",
    width: "100%",
  },
  week: {
    position: "absolute",
  },
  weekBorder: {
    position: "absolute",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
});
