import { Text } from "@/src/components/ui/text";
import { useUserStore } from "@/src/store/user-store";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const { isOnboarded, isLoading } = useUserStore();

  console.log("📱 TabLayout render:", { isOnboarded, isLoading });

  if (isLoading) {
    console.log("⏳ TabLayout: Still loading");
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FAFF00" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isOnboarded) {
    console.log("🚫 TabLayout: Not onboarded, redirecting to /onboarding");
    return <Redirect href="/onboarding" />;
  }

  console.log("✅ TabLayout: Rendering tabs");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FAFF00",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1B1A1A",
          borderTopColor: "#333",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Life Table",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
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
    fontSize: 16,
  },
});
