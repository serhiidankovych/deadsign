import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { RelativePathString, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "@/src/store/user-store";

import { Text } from "@/src/components/ui/text";
import { LifeTable } from "@/src/components/life-table";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const { user, isOnboarded } = useUserStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isOnboarded) {
      router.replace("/onboarding/" as RelativePathString);
    }
  }, [isOnboarded, isMounted]);

  if (!isMounted || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="body" style={styles.loadingText}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="title" style={styles.greeting}>
            Hello, {user.name}
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Your life in weeks
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="caption" style={styles.statLabel}>
              Age
            </Text>
            <Text variant="subtitle" style={styles.statValue}>
              {user.currentAge} years
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="caption" style={styles.statLabel}>
              Life Expectancy
            </Text>
            <Text variant="subtitle" style={styles.statValue}>
              {user.lifeExpectancy} years
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="caption" style={styles.statLabel}>
              Weeks Lived
            </Text>
            <Text variant="subtitle" style={styles.statValue}>
              {user.weeksLived}
            </Text>
          </View>
        </View>

        <View style={styles.lifeTableContainer}>
          <LifeTable user={user} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0D0D",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FAFF00",
  },
  content: {
    padding: 20,
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    color: "#FAFF00",
    marginBottom: 8,
  },
  subtitle: {
    color: "#999",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#1B1A1A",
    padding: 20,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    color: "#FAFF00",
  },
  lifeTableContainer: {
    height: height * 0.7,
  },
});
