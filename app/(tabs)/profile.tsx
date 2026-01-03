import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useNotificationStore } from "@/src/features/notification/store/notification-store";
import { useUserStore } from "@/src/store/user-store";
import * as Notifications from "expo-notifications";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SettingsLink({
  label,
  icon,
  onPress,
  showBadge = false,
  badgeText,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeText?: string;
}) {
  return (
    <Pressable style={styles.settingsLink} onPress={onPress}>
      <View style={styles.settingsLinkLeft}>
        <Text style={styles.settingsLinkIcon}>{icon}</Text>
        <View style={styles.settingsLinkTextContainer}>
          <Text variant="body" style={styles.settingsLinkLabel}>
            {label}
          </Text>
          {showBadge && badgeText && (
            <Text style={styles.badgeSubtext}>{badgeText}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingsLinkRight}>
        {showBadge && <View style={styles.badge} />}
        <Text style={styles.settingsLinkArrow}>›</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, clearUser } = useUserStore();
  const { settings } = useNotificationStore();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [hasCustomNotifications, setHasCustomNotifications] =
    React.useState(false);

  React.useEffect(() => {
    const checkNotificationStatus = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      const permissionGranted = status === "granted";
      const hasNotifications = (settings.customNotifications?.length ?? 0) > 0;
      const isEnabled = settings.enabled;

      setNotificationsEnabled(
        permissionGranted && isEnabled && hasNotifications
      );
      setHasCustomNotifications(hasNotifications);
    };

    checkNotificationStatus();
  }, [settings.enabled, settings.customNotifications]);

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
          onPress: async () => {
            await clearUser();
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
    <SafeAreaView edges={["top"]} style={styles.container}>
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
              showBadge={!notificationsEnabled}
              badgeText={
                !hasCustomNotifications
                  ? "No reminders created"
                  : !settings.enabled
                  ? "Disabled"
                  : "Setup required"
              }
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
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  settingsLinkLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsLinkIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingsLinkTextContainer: {
    flex: 1,
  },
  settingsLinkLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  badgeSubtext: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 2,
    fontWeight: "500",
  },
  settingsLinkRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
  },
  settingsLinkArrow: {
    fontSize: 22,
    color: Colors.textMuted,
  },
});
