/* eslint-disable react/display-name */
import React, { useMemo, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const { height } = Dimensions.get("window");
const WEEKS_PER_ROW = 52;
const ROW_BUFFER = 10;
const HEADER_HEIGHT = 30;
const YEAR_LABEL_WIDTH = 40;

interface User {
  weeksLived: number;
  totalWeeks: number;
}

interface LifeTableProps {
  user: User;
}

const Week = React.memo(
  ({
    weekIndex,
    user,
    squareSize,
    currentWeekProgress,
  }: {
    weekIndex: number;
    user: User;
    squareSize: number;
    currentWeekProgress: number;
  }) => {
    const isLived = weekIndex < user.weeksLived;
    const isCurrentWeek = weekIndex === user.weeksLived;

    const weekStyle = useMemo(
      () => [
        styles.week,
        { width: squareSize, height: squareSize },
        isLived && styles.weekLived,
        isCurrentWeek && styles.weekCurrent,
      ],
      [squareSize, isLived, isCurrentWeek]
    );

    if (isCurrentWeek) {
      return (
        <View style={weekStyle}>
          <View
            style={[styles.weekProgress, { width: `${currentWeekProgress}%` }]}
          />
        </View>
      );
    }

    return <View style={weekStyle} />;
  }
);

const Row = React.memo(
  ({
    rowIndex,
    user,
    squareSize,
    currentWeekProgress,
  }: {
    rowIndex: number;
    user: User;
    squareSize: number;
    currentWeekProgress: number;
  }) => {
    const startWeek = rowIndex * WEEKS_PER_ROW;
    const weekCount = Math.min(WEEKS_PER_ROW, user.totalWeeks - startWeek);

    return (
      <View style={[styles.row, { height: squareSize + 2 }]}>
        {Array.from({ length: weekCount }).map((_, i) => (
          <Week
            key={startWeek + i}
            weekIndex={startWeek + i}
            user={user}
            squareSize={squareSize}
            currentWeekProgress={currentWeekProgress}
          />
        ))}
      </View>
    );
  }
);

export const LifeTable: React.FC<LifeTableProps> = ({ user }) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const tableData = useMemo(() => {
    const baseSquareSize = 10;
    const squareSize = Math.max(
      4,
      Math.floor(baseSquareSize * savedScale.value)
    );
    const rowHeight = squareSize + 2;
    const totalRows = Math.ceil(user.totalWeeks / WEEKS_PER_ROW);
    const currentWeekRow = Math.floor(user.weeksLived / WEEKS_PER_ROW);

    return {
      squareSize,
      rowHeight,
      totalRows,
      currentWeekRow,
      totalContentHeight: totalRows * rowHeight + HEADER_HEIGHT,
      totalContentWidth: (squareSize + 1) * WEEKS_PER_ROW,
    };
  }, [user.totalWeeks, user.weeksLived, savedScale.value]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const { visibleStartRow, visibleEndRow } = useMemo(() => {
    const start = Math.floor(-translateY.value / tableData.rowHeight);
    const end = start + Math.ceil(height / tableData.rowHeight);
    return {
      visibleStartRow: Math.max(0, start - ROW_BUFFER),
      visibleEndRow: Math.min(tableData.totalRows, end + ROW_BUFFER),
    };
  }, [translateY.value, tableData.rowHeight, tableData.totalRows]);

  const currentWeekProgress = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return ((dayOfWeek === 0 ? 7 : dayOfWeek) / 7) * 100;
  }, []);

  useEffect(() => {
    const targetY = tableData.currentWeekRow * tableData.rowHeight - height / 4;
    translateY.value = withSpring(-targetY, { damping: 15 });
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.controlsContainer}></View>

      <View style={styles.tableWrapper}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={animatedStyle}>
            <View
              style={[
                styles.stickyYearColumn,
                { top: HEADER_HEIGHT - translateY.value },
              ]}
            >
              {Array.from({ length: tableData.totalRows }).map((_, i) => (
                <Text
                  key={i}
                  style={[
                    styles.ageLabel,
                    {
                      height: tableData.rowHeight,
                      fontSize: Math.max(
                        8,
                        10 * Math.min(savedScale.value, 1.2)
                      ),
                    },
                    i === tableData.currentWeekRow && styles.currentRowLabel,
                  ]}
                >
                  {i}
                </Text>
              ))}
            </View>

            <View style={styles.stickyHeader}>
              {Array.from({ length: WEEKS_PER_ROW }).map((_, i) => (
                <Text
                  key={i}
                  style={[
                    styles.headerLabel,
                    { width: tableData.squareSize + 1 },
                  ]}
                >
                  {(i + 1) % 5 === 0 ? i + 1 : ""}
                </Text>
              ))}
            </View>

            <View style={styles.rowsContainer}>
              {Array.from({ length: visibleEndRow - visibleStartRow }).map(
                (_, i) => {
                  const rowIndex = visibleStartRow + i;
                  return (
                    <View
                      key={rowIndex}
                      style={{
                        top: rowIndex * tableData.rowHeight,
                        position: "absolute",
                      }}
                    >
                      <Row
                        rowIndex={rowIndex}
                        user={user}
                        squareSize={tableData.squareSize}
                        currentWeekProgress={currentWeekProgress}
                      />
                    </View>
                  );
                }
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1B1A1A",
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 10,
    flex: 1,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  tableWrapper: {
    flex: 1,
    backgroundColor: "#0E0D0D",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  stickyYearColumn: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 10,
    backgroundColor: "#0E0D0D",
    width: YEAR_LABEL_WIDTH,
    paddingRight: 5,
  },
  stickyHeader: {
    flexDirection: "row",
    backgroundColor: "#1C1C1C",
    height: HEADER_HEIGHT,
    paddingLeft: YEAR_LABEL_WIDTH,
  },
  headerLabel: {
    color: "#888",
    fontSize: 9,
    textAlign: "center",
  },
  rowsContainer: {
    position: "relative",
    paddingLeft: YEAR_LABEL_WIDTH,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  ageLabel: {
    color: "#666",
    textAlign: "right",
    fontWeight: "500",
  },
  currentRowLabel: {
    color: "#FAFF00",
    fontWeight: "bold",
  },
  week: {
    backgroundColor: "#333",
    marginRight: 1,
    borderRadius: 2,
  },
  weekLived: {
    backgroundColor: "#FAFF00",
  },
  weekCurrent: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
    overflow: "hidden",
  },
  weekProgress: {
    backgroundColor: "#FF6B6B",
    height: "100%",
  },
});
