import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { DimensionValue, StyleSheet, View } from "react-native";

export const ProgressBar = ({
  percentageCompleted,
}: {
  percentageCompleted: string;
}) => {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressBarBackground}>
        <LinearGradient
          colors={[
            Colors.progressBarStart,
            Colors.progressBarMiddle,
            Colors.progressBarEnd,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressBarFill,
            { width: `${percentageCompleted}%` as DimensionValue },
          ]}
        />
      </View>
      <Text variant="caption" style={styles.progressText}>
        {percentageCompleted}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 8 },
  progressText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
    minWidth: 30,
  },
});
