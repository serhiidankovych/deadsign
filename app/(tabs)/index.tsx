import { ProgressBar } from "@/src/components/ui/progress-bar";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { LifeTable } from "@/src/features/life-table/components/life-table";
import { useUserStore } from "@/src/store/user-store";
import { calculateLifePercentage } from "@/src/utils/user-stats";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUserStore();
  if (!user) return null;

  const percentageLived = calculateLifePercentage(
    user.weeksLived,
    user.totalWeeks
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

          <ProgressBar percentageCompleted={percentageLived} />
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
