import { useMemo } from "react";
import {
  HEADER_HEIGHT,
  SQUARE_SIZE,
  SQUARE_SPACING,
  WEEKS_PER_ROW,
  YEAR_LABEL_WIDTH,
} from "../constants";
import type { TableData, User } from "../types";

export const useLifeTableData = (user: User): TableData => {
  return useMemo(() => {
    const totalRows = Math.ceil(user.totalWeeks / WEEKS_PER_ROW);
    const currentWeekRow = Math.floor(user.weeksLived / WEEKS_PER_ROW);
    const rowHeight = SQUARE_SIZE + SQUARE_SPACING;
    const canvasWidth = (SQUARE_SIZE + SQUARE_SPACING) * WEEKS_PER_ROW;
    const canvasHeight = totalRows * rowHeight;
    const fullWidth = canvasWidth + YEAR_LABEL_WIDTH;
    const fullHeight = canvasHeight + HEADER_HEIGHT;

    return {
      totalRows,
      currentWeekRow,
      rowHeight,
      canvasWidth,
      canvasHeight,
      fullWidth,
      fullHeight,
    };
  }, [user.totalWeeks, user.weeksLived]);
};
