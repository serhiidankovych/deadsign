import React from "react";
import { Text, View } from "react-native";
import { styles } from "./life-table-canvas.styles";

interface YearColumnProps {
  totalRows: number;
  currentWeekRow: number;
  rowHeight: number;
}

export const YearColumn: React.FC<YearColumnProps> = ({
  totalRows,
  currentWeekRow,
  rowHeight,
}) => {
  return (
    <View style={styles.yearColumn}>
      {Array.from({ length: totalRows }).map((_, i) => (
        <View key={i} style={[styles.yearRow, { height: rowHeight }]}>
          <Text
            style={[
              styles.ageLabel,
              i === currentWeekRow && styles.currentRowLabel,
            ]}
          >
            {i}
          </Text>
        </View>
      ))}
    </View>
  );
};
