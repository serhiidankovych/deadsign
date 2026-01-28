import { Colors } from "@/src/constants/colors";
import { Poppins_400Regular } from "@expo-google-fonts/poppins";
import {
  Canvas,
  Group,
  ImageFormat,
  Path,
  Rect,
  Skia,
  Text as SkText,
  useFont,
} from "@shopify/react-native-skia";
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import {
  HEADER_HEIGHT,
  SQUARE_SIZE,
  SQUARE_SPACING,
  WEEKS_PER_ROW,
  YEAR_LABEL_WIDTH,
} from "../constants";
import { TableData, User } from "../types";

export const CANVAS_PADDING = {
  LEFT: 40,
  TOP: 40,
  RIGHT: 20,
  BOTTOM: 20,
};

interface LifeTableCanvasProps {
  user: User;
  tableData: TableData;
}

export interface LifeTableCanvasRef {
  makeImage: () => Promise<string | null>;
}

export const LifeTableCanvas = forwardRef<
  LifeTableCanvasRef,
  LifeTableCanvasProps
>(({ user, tableData }, ref) => {
  const canvasRef = useRef<any>(null);
  const font = useFont(Poppins_400Regular, 10);
  const labelFont = useFont(Poppins_400Regular, 12);

  const canvasWidth =
    tableData.fullWidth + CANVAS_PADDING.LEFT + CANVAS_PADDING.RIGHT;
  const canvasHeight =
    tableData.fullHeight + CANVAS_PADDING.TOP + CANVAS_PADDING.BOTTOM;

  useImperativeHandle(ref, () => ({
    makeImage: async () => {
      if (!canvasRef.current) return null;
      const image = canvasRef.current.makeImageSnapshot();
      if (image) {
        const b64 = image.encodeToBase64(ImageFormat.PNG, 100);
        return `data:image/png;base64,${b64}`;
      }
      return null;
    },
  }));

  const {
    pastPath,
    futurePath,
    currentWeekRect,
    yearLabels,
    headerLabels,
    arrows,
  } = useMemo(() => {
    const pPath = Skia.Path.Make();
    const fPath = Skia.Path.Make();
    let cRect = null;
    const yLabels = [];
    const hLabels = [];

    for (let i = 0; i < user.totalWeeks; i++) {
      const row = Math.floor(i / WEEKS_PER_ROW);
      const col = i % WEEKS_PER_ROW;

      const x = YEAR_LABEL_WIDTH + col * (SQUARE_SIZE + SQUARE_SPACING);
      const y = HEADER_HEIGHT + row * (SQUARE_SIZE + SQUARE_SPACING);

      if (i < user.weeksLived) {
        pPath.addRect({ x, y, width: SQUARE_SIZE, height: SQUARE_SIZE });
      } else if (i === user.weeksLived) {
        const currentWeekProgress = 0.5;
        const width = Math.max(1, SQUARE_SIZE * currentWeekProgress);
        cRect = { x, y, width, fullX: x, fullY: y };
      } else {
        fPath.addRect({ x, y, width: SQUARE_SIZE, height: SQUARE_SIZE });
      }
    }

    for (let i = 0; i < tableData.totalRows; i += 1) {
      if (i % 5 === 0 || i === 0 || i === tableData.totalRows - 1) {
        const y =
          HEADER_HEIGHT + i * (SQUARE_SIZE + SQUARE_SPACING) + SQUARE_SIZE;
        yLabels.push({ text: i.toString(), x: 0, y });
      }
    }

    for (let i = 0; i < WEEKS_PER_ROW; i += 5) {
      const val = i + 1;
      const x = YEAR_LABEL_WIDTH + i * (SQUARE_SIZE + SQUARE_SPACING);
      hLabels.push({ text: val.toString(), x, y: HEADER_HEIGHT - 4 });
    }

    const arrowPath = Skia.Path.Make();
    const hArrowY = -15;
    const hArrowStartX = YEAR_LABEL_WIDTH + 50;
    const hArrowLength = 30;

    arrowPath.moveTo(hArrowStartX, hArrowY);
    arrowPath.lineTo(hArrowStartX + hArrowLength, hArrowY);
    arrowPath.moveTo(hArrowStartX + hArrowLength - 4, hArrowY - 3);
    arrowPath.lineTo(hArrowStartX + hArrowLength, hArrowY);
    arrowPath.lineTo(hArrowStartX + hArrowLength - 4, hArrowY + 3);

    const vArrowX = -15;
    const vArrowStartY = HEADER_HEIGHT + 40;
    const vArrowLength = 30;

    arrowPath.moveTo(vArrowX, vArrowStartY);
    arrowPath.lineTo(vArrowX, vArrowStartY + vArrowLength);
    arrowPath.moveTo(vArrowX - 3, vArrowStartY + vArrowLength - 4);
    arrowPath.lineTo(vArrowX, vArrowStartY + vArrowLength);
    arrowPath.lineTo(vArrowX + 3, vArrowStartY + vArrowLength - 4);

    return {
      pastPath: pPath,
      futurePath: fPath,
      currentWeekRect: cRect,
      yearLabels: yLabels,
      headerLabels: hLabels,
      arrows: arrowPath,
    };
  }, [user.totalWeeks, user.weeksLived, tableData]);

  if (!font || !labelFont) {
    return <View style={{ width: canvasWidth, height: 100 }} />;
  }

  return (
    <View
      style={[styles.container, { width: canvasWidth, height: canvasHeight }]}
    >
      <Canvas
        ref={canvasRef}
        style={{ width: canvasWidth, height: canvasHeight }}
      >
        <Group
          transform={[
            { translateX: CANVAS_PADDING.LEFT },
            { translateY: CANVAS_PADDING.TOP },
          ]}
        >
          <SkText
            x={YEAR_LABEL_WIDTH}
            y={-11}
            text="Weeks"
            font={labelFont}
            color={Colors.textSecondary}
          />

          <Group
            origin={{ x: -15, y: HEADER_HEIGHT + 35 }}
            transform={[{ rotate: -Math.PI / 2 }]}
          >
            <SkText
              x={-15}
              y={HEADER_HEIGHT + 35}
              text="Age"
              font={labelFont}
              color={Colors.textSecondary}
            />
          </Group>

          <Path
            path={arrows}
            style="stroke"
            strokeWidth={1.5}
            color={Colors.textSecondary}
          />

          <Path path={pastPath} color={Colors.lifePast} />
          <Path path={futurePath} color={Colors.lifeFuture} />

          {currentWeekRect && (
            <>
              <Rect
                x={currentWeekRect.fullX}
                y={currentWeekRect.fullY}
                width={SQUARE_SIZE}
                height={SQUARE_SIZE}
                style="stroke"
                strokeWidth={1}
                color={Colors.lifeCurrent}
              />
              <Rect
                x={currentWeekRect.x}
                y={currentWeekRect.y}
                width={currentWeekRect.width}
                height={SQUARE_SIZE}
                color={Colors.lifeCurrent}
              />
            </>
          )}

          {yearLabels.map((l, i) => (
            <SkText
              key={`y-${i}`}
              x={l.x}
              y={l.y}
              text={l.text}
              font={font}
              color={Colors.textSecondary}
            />
          ))}

          {headerLabels.map((l, i) => (
            <SkText
              key={`h-${i}`}
              x={l.x}
              y={l.y}
              text={l.text}
              font={font}
              color={Colors.textSecondary}
            />
          ))}
        </Group>
      </Canvas>
    </View>
  );
});

LifeTableCanvas.displayName = "LifeTableCanvas";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
});
