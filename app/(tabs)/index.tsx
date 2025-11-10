import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { LifeTable } from "@/src/features/life-table/components/life-table";
import { useUserStore } from "@/src/store/user-store";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { DimensionValue, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUserStore();
  if (!user) return null;

  const percentageLived = (
    (user.weeksLived / (user.lifeExpectancy * 52)) *
    100
  ).toFixed(0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.surfaceSecondary, Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text variant="title" style={styles.greeting}>
            Hello, {user.name}
          </Text>

          <Text variant="subtitle" style={styles.subtitle}>
            Your life in weeks
          </Text>

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
                  { width: `${percentageLived}%` as DimensionValue },
                ]}
              />
            </View>
            <Text variant="caption" style={styles.progressText}>
              {percentageLived}%
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="caption" style={styles.statLabel}>
              Age
            </Text>
            <Text variant="subtitle" style={styles.statValue}>
              {user.currentAge} yrs
            </Text>
          </View>

          <MaterialIcons
            name="arrow-forward-ios"
            size={18}
            color={Colors.textSecondary}
            style={styles.arrowIcon}
          />

          <View style={styles.statItem}>
            <Text variant="caption" style={styles.statLabel}>
              Expectancy
            </Text>
            <Text variant="subtitle" style={styles.statValue}>
              {user.lifeExpectancy} yrs
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text variant="caption" style={styles.statLabel}>
              Lived
            </Text>
            <Text variant="subtitle" style={styles.statValue}>
              {user.weeksLived} wks
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.lifeTableContainer}>
        <LifeTable user={user} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    marginBottom: 14,
  },
  greeting: {
    color: Colors.textPrimary,
    marginBottom: 10,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "left",
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 8,
  },
  progressText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
    minWidth: 30,
  },
  statsRow: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginBottom: 2,
    textAlign: "center",
  },
  statValue: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.surfaceSecondary,
    marginHorizontal: 8,
  },
  lifeTableContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
