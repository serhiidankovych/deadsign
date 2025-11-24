import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useUserStore } from "@/src/store/user-store";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SettingsLink({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.settingsLink} onPress={onPress}>
      <Text style={styles.settingsLinkIcon}>{icon}</Text>
      <Text variant="body" style={styles.settingsLinkLabel}>
        {label}
      </Text>
      <Text style={styles.settingsLinkArrow}>›</Text>
    </Pressable>
  );
}

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

  const userInfoItems = [
    { label: "Name", value: user.name },
    { label: "Date of Birth", value: user.dateOfBirth.toLocaleDateString() },
    { label: "Country", value: user.country },
    { label: "Current Age", value: `${user.currentAge} years` },
    { label: "Life Expectancy", value: `${user.lifeExpectancy} years` },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title" style={styles.title}>
          Profile
        </Text>

        <Card>
          {userInfoItems.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.infoRow,

                index === userInfoItems.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text variant="body" style={styles.label}>
                {item.label}
              </Text>
              <Text variant="body" style={styles.value}>
                {item.value}
              </Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text variant="caption" style={styles.sectionTitle}>
            App Settings
          </Text>
          <View style={styles.settingsGroup}>
            <SettingsLink
              icon="🔔"
              label="Manage Notifications"
              onPress={() => router.push("/notifications")}
            />
            <SettingsLink
              icon="✏️"
              label="Edit Profile"
              onPress={() => router.push("/modal")}
            />
          </View>
        </Card>

        <Card>
          <Text variant="caption" style={styles.sectionTitle}>
            Danger Zone
          </Text>
          <Button variant="danger" onPress={handleResetData}>
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  title: {
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  value: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  sectionTitle: {
    color: Colors.textMuted,
    marginBottom: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  settingsGroup: {
    gap: 8,
  },
  settingsLink: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  settingsLinkIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingsLinkLabel: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  settingsLinkArrow: {
    fontSize: 22,
    color: Colors.textMuted,
  },
});
