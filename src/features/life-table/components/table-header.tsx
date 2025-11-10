import React from "react";
import { Text, View } from "react-native";
import {
  SQUARE_SIZE,
  SQUARE_SPACING,
  WEEKS_PER_ROW,
  YEAR_LABEL_WIDTH,
} from "../constants";
import { styles } from "./life-table-canvas.styles";

export const TableHeader: React.FC = () => {
  return (
    <View style={styles.stickyHeader}>
      <View style={{ width: YEAR_LABEL_WIDTH }} />
      {Array.from({ length: WEEKS_PER_ROW }).map((_, i) => (
        <Text
          key={i}
          style={[styles.headerLabel, { width: SQUARE_SIZE + SQUARE_SPACING }]}
        >
          {(i + 1) % 5 === 0 ? i + 1 : ""}
        </Text>
      ))}
    </View>
  );
};
