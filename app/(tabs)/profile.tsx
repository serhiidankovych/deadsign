import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { NotificationSettings } from "@/src/features/notification/components/notification-settings";
import { useUserStore } from "@/src/store/user-store";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, clearUser } = useUserStore();

  if (!user) return null;

  const handleResetData = () => {
    Alert.alert(
      "Reset Data",
      "This will clear all your data and restart the onboarding process.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            clearUser();
            router.replace("/onboarding" as RelativePathString);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="title" style={styles.title}>
          Profile
        </Text>

        <Card style={styles.userInfo}>
          <View style={styles.infoRow}>
            <Text variant="body" style={styles.label}>
              Name
            </Text>
            <Text variant="body" style={styles.value}>
              {user.name}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="body" style={styles.label}>
              Date of Birth
            </Text>
            <Text variant="body" style={styles.value}>
              {user.dateOfBirth.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="body" style={styles.label}>
              Country
            </Text>
            <Text variant="body" style={styles.value}>
              {user.country}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="body" style={styles.label}>
              Current Age
            </Text>
            <Text variant="body" style={styles.value}>
              {user.currentAge} years
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="body" style={styles.label}>
              Life Expectancy
            </Text>
            <Text variant="body" style={styles.value}>
              {user.lifeExpectancy} years
            </Text>
          </View>
        </Card>

        <NotificationSettings />

        <Card style={styles.settingsCard}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            Settings
          </Text>
          <Button
            variant="secondary"
            onPress={() => router.push("/modal")}
            style={styles.settingButton}
          >
            Edit Profile
          </Button>
          <Button
            variant="danger"
            onPress={handleResetData}
            style={styles.settingButton}
          >
            Reset All Data
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0D0D",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    color: "#FAFF00",
    marginBottom: 30,
  },
  userInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  label: {
    color: "#999",
  },
  value: {
    color: "#FFF",
    fontWeight: "600",
  },
  settingsCard: {
    gap: 16,
    marginTop: 20,
  },
  sectionTitle: {
    color: "#FAFF00",
    marginBottom: 8,
  },
  settingButton: {
    marginBottom: 8,
  },
});
