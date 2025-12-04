import { ProgressBar } from "@/src/components/ui/progress-bar";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { LifeTable } from "@/src/features/life-table/components/life-table";
import { useLoadingStore } from "@/src/store/loading-store";
import { useUserStore } from "@/src/store/user-store";
import { calculateLifePercentage } from "@/src/utils/user-stats";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUserStore();
  const { setGlobalLoading } = useLoadingStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      setGlobalLoading(true);
      hasInitialized.current = true;
    }
  }, []);

  const handleLoadingChange = useCallback(
    (isLoading: boolean) => {
      if (!isLoading) {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  if (!user) return null;

  const percentageLived = calculateLifePercentage(
    user.weeksLived,
    user.totalWeeks
  ).toFixed(0);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
          <LifeTable user={user} onLoadingChange={handleLoadingChange} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
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
  lifeTableContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
