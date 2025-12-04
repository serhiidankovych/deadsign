import React from "react";
import { StyleSheet, View } from "react-native";
import type { LifeTableCanvasProps } from "../types";
import { TableHeader } from "./table-header";
import { WeeksRenderer } from "./weeks-renderer";
import { YearColumn } from "./year-column";

export const LifeTableCanvas = React.memo<LifeTableCanvasProps>(
  ({ user, tableData }) => {
    return (
      <View style={styles.tableWrapper}>
        <TableHeader />
        <View style={styles.tableContent}>
          <YearColumn
            totalRows={tableData.totalRows}
            currentWeekRow={tableData.currentWeekRow}
            rowHeight={tableData.rowHeight}
          />
          <View
            style={[
              styles.canvasWrapper,
              {
                width: tableData.canvasWidth,
                height: tableData.canvasHeight,
              },
            ]}
          >
            <WeeksRenderer user={user} />
          </View>
        </View>
      </View>
    );
  }
);

LifeTableCanvas.displayName = "LifeTableCanvas";

const styles = StyleSheet.create({
  tableWrapper: {
    flex: 1,
  },
  tableContent: {
    flexDirection: "row",
  },
  canvasWrapper: {
    position: "relative",
  },
});
