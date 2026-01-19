import { ScreenLayout } from "@/src/components/layout/screen-layout";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useNotificationStore } from "@/src/features/notification/store/notification-store";
import { useUserStore } from "@/src/store/user-store";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

function SettingsLink({ label, icon, onPress, showBadge, badgeText }: any) {
  return (
    <Pressable style={styles.settingsLink} onPress={onPress}>
      <View style={styles.settingsLinkLeft}>
        <Text style={styles.settingsLinkIcon}>{icon}</Text>
        <View>
          <Text variant="body" style={styles.settingsLinkLabel}>
            {label}
          </Text>
          {showBadge && <Text style={styles.badgeSubtext}>{badgeText}</Text>}
        </View>
      </View>
      <Text style={styles.settingsLinkArrow}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, clearUser } = useUserStore();
  const { settings } = useNotificationStore();
  const [notifState, setNotifState] = React.useState({
    enabled: false,
    hasCustom: false,
  });
  const [isResetting, setIsResetting] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      const has = (settings.customNotifications?.length ?? 0) > 0;
      setNotifState({
        enabled: status === "granted" && settings.enabled && has,
        hasCustom: has,
      });
    })();
  }, [settings.enabled, settings.customNotifications]);

  if (!user) return null;

  const handleResetAllData = async () => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete:\n\n• Your profile and life data\n• All notification reminders\n• Onboarding progress\n• Life table cache\n\nThis action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            try {
              setIsResetting(true);
              await clearUser();
              router.replace("/onboarding" as any);
            } catch (error) {
              console.error("Error resetting data:", error);
              Alert.alert("Error", "Failed to reset data. Please try again.");
            } finally {
              setIsResetting(false);
            }
          },
        },
      ],
    );
  };

  const userInfo = [
    { label: "Name", value: user.name },
    { label: "Date of Birth", value: user.dateOfBirth.toLocaleDateString() },
    { label: "Country", value: user.country },
    { label: "Current Age", value: `${user.currentAge} years` },
  ];

  return (
    <ScreenLayout title="Profile">
      <Card>
        {userInfo.map((item, i) => (
          <View
            key={item.label}
            style={[
              styles.infoRow,
              i === userInfo.length - 1 && { borderBottomWidth: 0 },
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
        <View style={{ gap: 8 }}>
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
        <Button
          variant="danger"
          onPress={handleResetAllData}
          disabled={isResetting}
        >
          {isResetting ? "Resetting..." : "Reset All Data"}
        </Button>
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { color: Colors.textSecondary, fontWeight: "500" },
  value: { color: Colors.textPrimary, fontWeight: "600" },
  sectionTitle: {
    color: Colors.textMuted,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  settingsLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  settingsLinkLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  settingsLinkIcon: { fontSize: 20 },
  settingsLinkLabel: { color: Colors.textPrimary, fontSize: 16 },
  badgeSubtext: { fontSize: 12, color: "#EF4444" },
  settingsLinkArrow: { fontSize: 22, color: Colors.textMuted },
});
