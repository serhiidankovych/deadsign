import { Canvas, Group } from "@shopify/react-native-skia";
import React from "react";
import { View } from "react-native";
import type { LifeTableCanvasProps } from "../types";
import { styles } from "./life-table-canvas.styles";
import { TableHeader } from "./table-header";
import { WeeksRenderer } from "./weeks-renderer";
import { YearColumn } from "./year-column";

export const LifeTableCanvas: React.FC<LifeTableCanvasProps> = ({
  user,
  tableData,
}) => {
  return (
    <View style={styles.tableWrapper}>
      <TableHeader />

      <View style={styles.tableContent}>
        <YearColumn
          totalRows={tableData.totalRows}
          currentWeekRow={tableData.currentWeekRow}
          rowHeight={tableData.rowHeight}
        />

        <View style={styles.canvasWrapper}>
          <Canvas
            style={{
              width: tableData.canvasWidth,
              height: tableData.canvasHeight,
            }}
          >
            <Group>
              <WeeksRenderer user={user} />
            </Group>
          </Canvas>
        </View>
      </View>
    </View>
  );
};
