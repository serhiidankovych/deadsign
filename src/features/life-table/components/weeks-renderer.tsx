import { Colors } from "@/src/constants/colors";
import { Rect } from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { SQUARE_SIZE, SQUARE_SPACING, WEEKS_PER_ROW } from "../constants";
import { useCurrentWeekProgress } from "../hooks/use-current-week-progress";
import type { User } from "../types";

interface WeeksRendererProps {
  user: User;
}

export const WeeksRenderer: React.FC<WeeksRendererProps> = ({ user }) => {
  const currentWeekProgress = useCurrentWeekProgress();

  console.log("WeeksRenderer render:", {
    weeksLived: user.weeksLived,
    totalWeeks: user.totalWeeks,
    currentWeekProgress,
  });

  const renderWeeks = useMemo(() => {
    console.log("Recalculating weeks array:", {
      weeksLived: user.weeksLived,
      totalWeeks: user.totalWeeks,
      currentWeekProgress,
    });

    const weeks = [];

    for (let weekIndex = 0; weekIndex < user.totalWeeks; weekIndex++) {
      const row = Math.floor(weekIndex / WEEKS_PER_ROW);
      const col = weekIndex % WEEKS_PER_ROW;
      const x = col * (SQUARE_SIZE + SQUARE_SPACING);
      const y = row * (SQUARE_SIZE + SQUARE_SPACING);

      const isLived = weekIndex < user.weeksLived;
      const isCurrentWeek = weekIndex === user.weeksLived;

      let color: string = Colors.lifeFuture;
      let width = SQUARE_SIZE;

      if (isCurrentWeek) {
        color = Colors.lifeCurrent;
        width = SQUARE_SIZE * currentWeekProgress;
      } else if (isLived) {
        color = Colors.error;
      }

      weeks.push(
        <Rect
          key={weekIndex}
          x={x}
          y={y}
          width={width}
          height={SQUARE_SIZE}
          color={color}
        />
      );

      if (isCurrentWeek) {
        weeks.push(
          <Rect
            key={`border-${weekIndex}`}
            x={x}
            y={y}
            width={SQUARE_SIZE}
            height={SQUARE_SIZE}
            color={Colors.lifeCurrent}
            style="stroke"
            strokeWidth={1}
          />
        );
      }
    }

    console.log(`Generated ${weeks.length} week elements`);
    return weeks;
  }, [user.weeksLived, user.totalWeeks, currentWeekProgress]);

  return <>{renderWeeks}</>;
};
