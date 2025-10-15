import { LifeTable } from "@/src/components/life-table";
import { Text } from "@/src/components/ui/text";
import { useUserStore } from "@/src/store/user-store";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const { user, isLoading, isOnboarded } = useUserStore();
  const router = useRouter();

  console.log("🏠 HomeScreen render:", {
    isLoading,
    isOnboarded,
    hasUser: !!user,
  });

  if (isLoading) {
    console.log("⏳ Still loading...");
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FAFF00" />
          <Text variant="body" style={styles.loadingText}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isOnboarded || !user) {
    console.log("⚠️  User not onboarded, should redirect to /onboarding");

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="body" style={styles.errorText}>
            Please complete onboarding first
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("✅ Rendering home screen for user:", user.name);

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
    marginTop: 16,
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 16,
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
