import { ScreenLayout } from "@/src/components/layout/screen-layout";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useNotificationStore } from "@/src/features/notification/store/notification-store";
import { useUserStore } from "@/src/store/user-store";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 64) / 2.1;

function SettingsLink({ label, icon, onPress, showBadge, badgeText }: any) {
  return (
    <Pressable style={styles.settingsLink} onPress={onPress}>
      <View style={styles.settingsLinkLeft}>
        {typeof icon === "string" ? (
          <Text style={styles.settingsLinkIcon}>{icon}</Text>
        ) : (
          icon
        )}
        <View style={{ flex: 1 }}>
          <Text
            variant="body"
            style={styles.settingsLinkLabel}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
          {showBadge && <Text style={styles.badgeSubtext}>{badgeText}</Text>}
        </View>
      </View>
      <Text style={styles.settingsLinkArrow}>›</Text>
    </Pressable>
  );
}

function StatCard({ label, value, subtitle }: any) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statContent}>
        <Text variant="caption" style={styles.statLabel}>
          {label}
        </Text>
        {/* adjustFontSizeToFit ensures massive numbers don't get cut off */}
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {subtitle && (
          <Text variant="caption" style={styles.statSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
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
  const [showInfo, setShowInfo] = React.useState(false);

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

  const weeksRemaining = user.totalWeeks - user.weeksLived;
  const percentageLived = ((user.weeksLived / user.totalWeeks) * 100).toFixed(
    1,
  );
  const yearsRemaining = (weeksRemaining / 52).toFixed(1);
  const daysLived = user.weeksLived * 7;

  const today = new Date();
  const dob = new Date(user.dateOfBirth);
  const nextBirthday = new Date(
    today.getFullYear(),
    dob.getMonth(),
    dob.getDate(),
  );
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const daysUntilBirthday = Math.ceil(
    (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const userInfo = [
    { label: "Name", value: user.name },
    { label: "Date of Birth", value: user.dateOfBirth.toLocaleDateString() },
    { label: "Country", value: user.country },
    { label: "Current Age", value: `${user.currentAge} years` },
  ];

  return (
    <ScreenLayout title="Profile">
      {/* User Info Table */}
      <Card>
        {userInfo.map((item, i) => (
          <View style={styles.infoRow} key={item.label}>
            <Text variant="body" style={styles.label}>
              {item.label}
            </Text>

            {/* 
               1. flex: 1 ensures it takes available space but respects bounds.
               2. numberOfLines={1} cuts it off at one line.
               3. ellipsizeMode="tail" adds the "..." at the end.
            */}
            <Text
              variant="body"
              style={styles.value}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.value}
            </Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text variant="caption" style={styles.sectionTitle}>
          Life Statistics
        </Text>
        <View style={styles.statsScrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
          >
            <StatCard
              label="LIFE PROGRESS"
              value={`${percentageLived}%`}
              subtitle={`${user.weeksLived.toLocaleString()} / ${user.totalWeeks.toLocaleString()}`}
            />
            <StatCard
              label="WEEKS LEFT"
              value={weeksRemaining.toLocaleString()}
              subtitle={`~${yearsRemaining} years`}
            />
            <StatCard
              label="DAYS LIVED"
              value={daysLived.toLocaleString()}
              subtitle="Since birth"
            />
            <StatCard
              label="NEXT BIRTHDAY"
              value={`${daysUntilBirthday} days`}
              subtitle={nextBirthday.toLocaleDateString()}
            />
          </ScrollView>
        </View>
      </Card>

      <Card>
        <Text variant="caption" style={styles.sectionTitle}>
          App Settings
        </Text>
        <View style={{ gap: 8 }}>
          <SettingsLink
            icon={
              <Ionicons
                name="create-outline"
                size={20}
                color={Colors.textMuted}
              />
            }
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

      <TouchableOpacity
        style={styles.infoCard}
        onPress={() => setShowInfo(!showInfo)}
        activeOpacity={0.7}
      >
        <View style={styles.infoHeader}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={Colors.textMuted}
          />
          <Text variant="body" style={styles.infoTitle}>
            How to read your life table
          </Text>
          <Ionicons
            name={showInfo ? "chevron-up" : "chevron-down"}
            size={20}
            color={Colors.textMuted}
          />
        </View>

        {showInfo && (
          <View style={styles.infoContent}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendSquare,
                    { backgroundColor: Colors.lifePast },
                  ]}
                />
                <Text variant="caption" style={styles.legendText}>
                  Weeks lived
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendSquare,
                    {
                      backgroundColor: Colors.lifeCurrent,
                      borderWidth: 1,
                      borderColor: Colors.lifeCurrent,
                    },
                  ]}
                />
                <Text variant="caption" style={styles.legendText}>
                  Current
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendSquare,
                    { backgroundColor: Colors.lifeFuture },
                  ]}
                />
                <Text variant="caption" style={styles.legendText}>
                  Future
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.explanationSection}>
              <View style={styles.explanationRow}>
                <Ionicons
                  name="arrow-forward-outline"
                  size={16}
                  color={Colors.accentPrimary}
                />
                <Text variant="caption" style={styles.explanationText}>
                  <Text style={styles.bold}>Horizontally:</Text> Each row is one
                  year (52 weeks)
                </Text>
              </View>
              <View style={styles.explanationRow}>
                <Ionicons
                  name="arrow-down-outline"
                  size={16}
                  color={Colors.accentPrimary}
                />
                <Text variant="caption" style={styles.explanationText}>
                  <Text style={styles.bold}>Vertically:</Text> Same week across
                  different years
                </Text>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    color: Colors.textSecondary,
    fontWeight: "500",
    marginRight: 16,
  },
  value: {
    color: Colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
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
  settingsLinkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  settingsLinkIcon: { fontSize: 20 },
  settingsLinkLabel: { color: Colors.textPrimary, fontSize: 16 },
  badgeSubtext: { fontSize: 12, color: "#EF4444" },
  settingsLinkArrow: { fontSize: 22, color: Colors.textMuted },
  statsScrollWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  statsScrollContent: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statValue: {
    color: Colors.textSecondary,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  statSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  infoContent: {
    marginTop: 16,
    paddingTop: 16,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  explanationSection: {
    gap: 8,
    marginBottom: 16,
  },
  explanationRow: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 16,
  },
  explanationText: {
    color: Colors.textSecondary,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});
