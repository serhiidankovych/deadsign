import AsyncStorage from "@react-native-async-storage/async-storage";
import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import { File, Paths } from "expo-file-system";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";

const WEEKS_PER_ROW = 52;
const HEADER_HEIGHT = 30;
const YEAR_LABEL_WIDTH = 40;
const SQUARE_SIZE = 10;
const SQUARE_SPACING = 1;

const CACHE_FILE = new File(Paths.document, "life_table_cache.png");
const CACHE_TIMESTAMP_KEY = "life_table_cache_timestamp";

interface User {
  weeksLived: number;
  totalWeeks: number;
}

interface LifeTableProps {
  user: User;
}

const isNewDay = (timestamp1: number, timestamp2: number) => {
  const date1 = new Date(timestamp1).toDateString();
  const date2 = new Date(timestamp2).toDateString();
  return date1 !== date2;
};

export const LifeTable: React.FC<LifeTableProps> = ({ user }) => {
  const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
  const [isCacheLoading, setIsCacheLoading] = useState(true);
  const [isReadyToCapture, setIsReadyToCapture] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const tableData = useMemo(() => {
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

  const currentWeekProgress = useMemo(() => {
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
  }, [user]);

  useEffect(() => {
    const loadImageOrPrepareCapture = async () => {
      try {
        const timestampStr = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (
          timestampStr &&
          (await CACHE_FILE.exists) &&
          !isNewDay(parseInt(timestampStr, 10), Date.now())
        ) {
          setCachedImageUri(`${CACHE_FILE.uri}?t=${Date.now()}`);
          setIsReadyToCapture(false);
        } else {
          setIsReadyToCapture(true);
        }
      } catch (error) {
        console.error("Failed to load cached image:", error);
        setIsReadyToCapture(true);
      } finally {
        setIsCacheLoading(false);
      }
    };
    loadImageOrPrepareCapture();
  }, [user]);

  const captureAndSaveImage = async () => {
    if (viewShotRef.current?.capture) {
      try {
        const localUri = await viewShotRef.current.capture();
        if (!localUri) {
          throw new Error("Capture failed to produce a URI.");
        }
        const tempFile = new File(localUri);

        if (await CACHE_FILE.exists) {
          await CACHE_FILE.delete();
        }

        await tempFile.move(CACHE_FILE);
        await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

        setCachedImageUri(`${CACHE_FILE.uri}?t=${Date.now()}`);
        setIsReadyToCapture(false);
      } catch (error) {
        console.error("Failed to capture and save image:", error);
        setIsReadyToCapture(false);
      }
    }
  };

  useEffect(() => {
    if (isReadyToCapture) {
      setTimeout(captureAndSaveImage, 500);
    }
  }, [isReadyToCapture]);

  useEffect(() => {
    if (cachedImageUri && scrollViewRef.current) {
      const targetY = tableData.currentWeekRow * tableData.rowHeight;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
      }, 300);
    }
  }, [cachedImageUri, tableData.currentWeekRow, tableData.rowHeight]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(3, savedScale.value * e.scale));
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

  const renderWeeks = useMemo(() => {
    const weeks = [];
    for (let weekIndex = 0; weekIndex < user.totalWeeks; weekIndex++) {
      const row = Math.floor(weekIndex / WEEKS_PER_ROW);
      const col = weekIndex % WEEKS_PER_ROW;

      const x = col * (SQUARE_SIZE + SQUARE_SPACING);
      const y = row * (SQUARE_SIZE + SQUARE_SPACING);

      const isLived = weekIndex < user.weeksLived;
      const isCurrentWeek = weekIndex === user.weeksLived;

      let color = "#333333";
      let width = SQUARE_SIZE;

      if (isCurrentWeek) {
        color = "#FF6B6B";
        width = SQUARE_SIZE * currentWeekProgress;
      } else if (isLived) {
        color = "#FAFF00";
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
            color="#FF6B6B"
            style="stroke"
            strokeWidth={1}
          />
        );
      }
    }
    return weeks;
  }, [user.weeksLived, user.totalWeeks, currentWeekProgress]);

  const TableToCapture = (
    <View style={styles.tableWrapper}>
      <View style={styles.stickyHeader}>
        <View style={{ width: YEAR_LABEL_WIDTH }} />
        {Array.from({ length: WEEKS_PER_ROW }).map((_, i) => (
          <Text
            key={i}
            style={[
              styles.headerLabel,
              { width: SQUARE_SIZE + SQUARE_SPACING },
            ]}
          >
            {(i + 1) % 5 === 0 ? i + 1 : ""}
          </Text>
        ))}
      </View>

      <View style={styles.tableContent}>
        <View style={styles.yearColumn}>
          {Array.from({ length: tableData.totalRows }).map((_, i) => (
            <View
              key={i}
              style={[styles.yearRow, { height: tableData.rowHeight }]}
            >
              <Text
                style={[
                  styles.ageLabel,
                  i === tableData.currentWeekRow && styles.currentRowLabel,
                ]}
              >
                {i}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.canvasWrapper}>
          <Canvas
            style={{
              width: tableData.canvasWidth,
              height: tableData.canvasHeight,
            }}
          >
            <Group>{renderWeeks}</Group>
          </Canvas>
        </View>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {isCacheLoading && (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color="#FAFF00" />
        </View>
      )}

      {!isCacheLoading && cachedImageUri && !isReadyToCapture && (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={animatedStyle}>
              <Image
                source={{ uri: cachedImageUri }}
                style={{
                  width: tableData.fullWidth,
                  height: tableData.fullHeight,
                }}
                resizeMode="contain"
              />
            </Animated.View>
          </GestureDetector>
        </ScrollView>
      )}

      {isReadyToCapture && (
        <View style={styles.captureContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{
              format: "png",
              quality: 0.9,
              width: tableData.fullWidth,
              height: tableData.fullHeight,
            }}
            style={{
              width: tableData.fullWidth,
              height: tableData.fullHeight,
            }}
          >
            {TableToCapture}
          </ViewShot>
        </View>
      )}

      {!isCacheLoading && !cachedImageUri && isReadyToCapture && (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color="#FAFF00" />
          <Text style={{ color: "white", marginTop: 10 }}>
            Generating your life table...
          </Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1B1A1A",
    borderRadius: 16,
    flex: 1,
    overflow: "hidden",
  },
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B1A1A",
  },
  captureContainer: {
    position: "absolute",
    top: 0,
    left: -10000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tableWrapper: {
    backgroundColor: "#0E0D0D",
  },
  stickyHeader: {
    flexDirection: "row",
    backgroundColor: "#1C1C1C",
    height: HEADER_HEIGHT,
    alignItems: "center",
  },
  headerLabel: {
    color: "#888",
    fontSize: 9,
    textAlign: "center",
  },
  tableContent: {
    flexDirection: "row",
  },
  yearColumn: {
    width: YEAR_LABEL_WIDTH,
    backgroundColor: "#0E0D0D",
  },
  yearRow: {
    justifyContent: "center",
    paddingRight: 5,
  },
  canvasWrapper: {
    flex: 1,
  },
  ageLabel: {
    color: "#666",
    textAlign: "right",
    fontWeight: "500",
    fontSize: 10,
  },
  currentRowLabel: {
    color: "#FAFF00",
    fontWeight: "bold",
  },
});
