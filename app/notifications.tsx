import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { TimePickerSection } from "@/src/features/notification/components/time-picker-section";
import { ToggleSection } from "@/src/features/notification/components/toggle-section";
import { useNotificationStore } from "@/src/features/notification/store/notification-store";
import {
  cancelAllNotifications,
  scheduleDailyReminder,
  UserStats,
} from "@/src/features/notification/utils/notifications";
import { useUserStore } from "@/src/store/user-store";

export default function NotificationSettingsScreen() {
  const {
    settings,
    setEnabled,
    setStatsReminder,
    setMotivationReminder,
    setStatsPreferences,
  } = useNotificationStore();
  const { user } = useUserStore();

  const [fadeAnim] = useState(new Animated.Value(settings.enabled ? 1 : 0.5));
  const [showStatsTimePicker, setShowStatsTimePicker] = useState(false);
  const [statsTime, setStatsTime] = useState(() => {
    const date = new Date();
    if (settings.statsReminderTime) {
      date.setHours(settings.statsReminderTime.hour);
      date.setMinutes(settings.statsReminderTime.minute);
    } else {
      date.setHours(9);
      date.setMinutes(0);
    }
    return date;
  });
  const [showMotivationTimePicker, setShowMotivationTimePicker] =
    useState(false);
  const [motivationTime, setMotivationTime] = useState(() => {
    const date = new Date();
    if (settings.motivationReminderTime) {
      date.setHours(settings.motivationReminderTime.hour);
      date.setMinutes(settings.motivationReminderTime.minute);
    } else {
      date.setHours(20);
      date.setMinutes(0);
    }
    return date;
  });

  useEffect(() => {
    if (settings.statsReminderTime) {
      const statsDate = new Date();
      statsDate.setHours(settings.statsReminderTime.hour);
      statsDate.setMinutes(settings.statsReminderTime.minute);
      setStatsTime(statsDate);
    }

    if (settings.motivationReminderTime) {
      const motivationDate = new Date();
      motivationDate.setHours(settings.motivationReminderTime.hour);
      motivationDate.setMinutes(settings.motivationReminderTime.minute);
      setMotivationTime(motivationDate);
    }
  }, [settings.statsReminderTime, settings.motivationReminderTime]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: settings.enabled ? 1 : 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [settings.enabled]);

  const scheduleAllReminders = async () => {
    await cancelAllNotifications();

    if (
      !settings.enabled ||
      !settings.statsReminderTime ||
      !settings.motivationReminderTime
    ) {
      return;
    }

    let stats: UserStats | undefined;
    if (user) {
      const percentageComplete = (user.weeksLived / user.totalWeeks) * 100;
      stats = {
        weeksLived: user.weeksLived,
        totalWeeks: user.totalWeeks,
        currentAge: user.currentAge,
        percentageComplete,
      };
    }

    if (settings.statsReminderEnabled && stats) {
      await scheduleDailyReminder(
        settings.statsReminderTime.hour,
        settings.statsReminderTime.minute,
        "stats",
        stats,
        settings.includeWeeksLived,
        false,
        settings.includeAgeProgress,
        "stats_reminder"
      );
    }

    if (settings.motivationReminderEnabled) {
      await scheduleDailyReminder(
        settings.motivationReminderTime.hour,
        settings.motivationReminderTime.minute,
        "motivation",
        undefined,
        false,
        false,
        false,
        "motivation_reminder"
      );
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setEnabled(value);
    if (!value) {
      await cancelAllNotifications();
    } else {
      await scheduleAllReminders();
    }
  };

  const handleToggleStatsReminder = async (value: boolean) => {
    setStatsReminder(value);
    await scheduleAllReminders();
  };

  const handleToggleMotivationReminder = async (value: boolean) => {
    setMotivationReminder(value);
    await scheduleAllReminders();
  };

  const handleStatsTimeChange = async (selectedDate?: Date) => {
    setShowStatsTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setStatsTime(selectedDate);
      setStatsReminder(
        true,
        selectedDate.getHours(),
        selectedDate.getMinutes()
      );
      await scheduleAllReminders();
    }
  };

  const handleMotivationTimeChange = async (selectedDate?: Date) => {
    setShowMotivationTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setMotivationTime(selectedDate);
      setMotivationReminder(
        true,
        selectedDate.getHours(),
        selectedDate.getMinutes()
      );
      await scheduleAllReminders();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text variant="subtitle" style={styles.title}>
          Notifications
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <ToggleSection
            label="Enable Notifications"
            description="Receive daily reminders and updates"
            value={settings.enabled}
            onToggle={handleToggleNotifications}
          />
        </Card>

        <Animated.View style={[{ opacity: fadeAnim }, styles.remindersList]}>
          <Card>
            <ToggleSection
              label="Stats Reminder"
              description="Track your life progress daily"
              value={settings.statsReminderEnabled}
              onToggle={handleToggleStatsReminder}
            />
            {settings.statsReminderEnabled && settings.enabled && (
              <View style={styles.expandedSection}>
                <TimePickerSection
                  time={statsTime}
                  showPicker={showStatsTimePicker}
                  onOpenPicker={() => setShowStatsTimePicker(true)}
                  onChange={handleStatsTimeChange}
                />
                {user && (
                  <Card variant="secondary" style={styles.preferences}>
                    <Text style={styles.preferencesLabel}>
                      Include in summary:
                    </Text>
                    <ToggleSection
                      label="Weeks Lived"
                      description=""
                      value={settings.includeWeeksLived}
                      onToggle={(value) =>
                        setStatsPreferences(value, settings.includeAgeProgress)
                      }
                    />
                    <ToggleSection
                      label="Life Progress (%)"
                      description=""
                      value={settings.includeAgeProgress}
                      onToggle={(value) =>
                        setStatsPreferences(settings.includeWeeksLived, value)
                      }
                    />
                  </Card>
                )}
              </View>
            )}
          </Card>

          <Card>
            <ToggleSection
              label="Motivation Reminder"
              description="Start your day with inspiration"
              value={settings.motivationReminderEnabled}
              onToggle={handleToggleMotivationReminder}
            />
            {settings.motivationReminderEnabled && settings.enabled && (
              <View style={styles.expandedSection}>
                <TimePickerSection
                  time={motivationTime}
                  showPicker={showMotivationTimePicker}
                  onOpenPicker={() => setShowMotivationTimePicker(true)}
                  onChange={handleMotivationTimeChange}
                />
              </View>
            )}
          </Card>
        </Animated.View>

        {!settings.enabled && (
          <View style={styles.disabledState}>
            <Text style={styles.disabledIcon}>🔕</Text>
            <Text style={styles.disabledText}>
              Notifications are turned off.
            </Text>
            <Text style={styles.disabledSubText}>
              Enable the master switch to set up your reminders.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  remindersList: {
    gap: 16,
  },
  expandedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 16,
  },
  preferences: {
    gap: 4,
  },
  preferencesLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  testButton: {
    marginTop: 8,
  },
  disabledState: {
    alignItems: "center",
    paddingVertical: 40,
    marginTop: 20,
  },
  disabledIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  disabledText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  disabledSubText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    maxWidth: "85%",
  },
});
