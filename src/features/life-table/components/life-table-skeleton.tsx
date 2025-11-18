import { Colors } from "@/src/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SQUARE_SIZE, SQUARE_SPACING } from "../constants";

const { width: screenWidth } = Dimensions.get("window");

const SkeletonRow: React.FC = () => (
  <View style={styles.row}>
    {/* Simplified rendering of 12 squares per row */}
    {Array.from({ length: 12 }).map((_, colIndex) => (
      <View key={colIndex} style={styles.square} />
    ))}
  </View>
);

interface LifeTableSkeletonProps {
  totalRows?: number;
}

export const LifeTableSkeleton: React.FC<LifeTableSkeletonProps> = ({
  totalRows = 90,
}) => {
  const translateX = useSharedValue(-screenWidth);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(screenWidth, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      false
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container} testID="life-table-skeleton">
      {/* This Animated.View contains the gradient and moves across the screen */}
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
          style={styles.gradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </Animated.View>

      {/* Render the placeholder shapes */}
      {Array.from({ length: totalRows }).map((_, rowIndex) => (
        <SkeletonRow key={rowIndex} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingVertical: 20,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    marginBottom: SQUARE_SPACING * 2,

    backgroundColor: Colors.surface,
    borderRadius: 4,
    height: SQUARE_SIZE,
    alignItems: "center",
    paddingHorizontal: SQUARE_SPACING,
  },
  square: {
    width: SQUARE_SIZE * 2,
    height: SQUARE_SIZE * 0.7,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    marginHorizontal: SQUARE_SPACING / 2,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "100%",
    zIndex: 1,
  },
  gradient: {
    flex: 1,
  },
});
