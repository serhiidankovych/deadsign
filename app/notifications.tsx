import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  getScheduledNotifications,
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

  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [fadeAnim] = useState(new Animated.Value(settings.enabled ? 1 : 0.5));
  const [showStatsTimePicker, setShowStatsTimePicker] = useState(false);

  const [statsTime, setStatsTime] = useState(() => {
    const date = new Date();
    if (
      settings.statsReminderTime?.hour !== undefined &&
      settings.statsReminderTime?.minute !== undefined
    ) {
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
    if (
      settings.motivationReminderTime?.hour !== undefined &&
      settings.motivationReminderTime?.minute !== undefined
    ) {
      date.setHours(settings.motivationReminderTime.hour);
      date.setMinutes(settings.motivationReminderTime.minute);
    } else {
      date.setHours(20);
      date.setMinutes(0);
    }
    return date;
  });

  useEffect(() => {
    if (
      settings.statsReminderTime?.hour !== undefined &&
      settings.statsReminderTime?.minute !== undefined
    ) {
      const statsDate = new Date();
      statsDate.setHours(settings.statsReminderTime.hour);
      statsDate.setMinutes(settings.statsReminderTime.minute);
      setStatsTime(statsDate);
    }

    if (
      settings.motivationReminderTime?.hour !== undefined &&
      settings.motivationReminderTime?.minute !== undefined
    ) {
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
    try {
      const currentSettings = useNotificationStore.getState().settings;
      const currentUser = userRef.current;

      console.log("🔄 Scheduling reminders with FRESH settings:", {
        enabled: currentSettings.enabled,
        statsTime: currentSettings.statsReminderTime,
        motivationTime: currentSettings.motivationReminderTime,
        hasUser: !!currentUser,
      });

      await cancelAllNotifications();

      if (!currentSettings.enabled) {
        console.log("⚠️ Notifications disabled, skipping scheduling");
        return;
      }

      let stats: UserStats | undefined;

      if (currentUser) {
        const percentageComplete =
          (currentUser.weeksLived / currentUser.totalWeeks) * 100;
        stats = {
          weeksLived: currentUser.weeksLived,
          totalWeeks: currentUser.totalWeeks,
          currentAge: currentUser.currentAge,
          percentageComplete,
        };
      }

      if (
        currentSettings.statsReminderEnabled &&
        currentSettings.statsReminderTime?.hour !== undefined &&
        currentSettings.statsReminderTime?.minute !== undefined &&
        stats
      ) {
        const id = await scheduleDailyReminder(
          currentSettings.statsReminderTime.hour,
          currentSettings.statsReminderTime.minute,
          "stats",
          stats,
          currentSettings.includeWeeksLived,
          false,
          currentSettings.includeAgeProgress,
          "stats_reminder"
        );
        console.log(
          `✅ Stats reminder scheduled at ${currentSettings.statsReminderTime.hour}:${currentSettings.statsReminderTime.minute} - ID: ${id}`
        );
      }

      if (
        currentSettings.motivationReminderEnabled &&
        currentSettings.motivationReminderTime?.hour !== undefined &&
        currentSettings.motivationReminderTime?.minute !== undefined
      ) {
        const id = await scheduleDailyReminder(
          currentSettings.motivationReminderTime.hour,
          currentSettings.motivationReminderTime.minute,
          "motivation",
          undefined,
          false,
          false,
          false,
          "motivation_reminder"
        );
        console.log(
          `✅ Motivation reminder scheduled at ${currentSettings.motivationReminderTime.hour}:${currentSettings.motivationReminderTime.minute} - ID: ${id}`
        );
      }

      const scheduled = await getScheduledNotifications();
      console.log(`📋 Total scheduled notifications: ${scheduled.length}`);
      scheduled.forEach((notif) => {
        console.log(
          `  - ${notif.identifier}: ${notif.content.title} at ${JSON.stringify(
            notif.trigger
          )}`
        );
      });
    } catch (error) {
      console.error("❌ Error in scheduleAllReminders:", error);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setEnabled(value);
    if (!value) {
      await cancelAllNotifications();
    } else {
      setTimeout(() => {
        scheduleAllReminders();
      }, 100);
    }
  };

  const handleToggleStatsReminder = async (value: boolean) => {
    setStatsReminder(value);
    setTimeout(() => {
      scheduleAllReminders();
    }, 100);
  };

  const handleToggleMotivationReminder = async (value: boolean) => {
    setMotivationReminder(value);
    setTimeout(() => {
      scheduleAllReminders();
    }, 100);
  };

  const handleStatsTimeChange = async (event: any, selectedDate?: Date) => {
    setShowStatsTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      console.log(
        "📅 Stats time changed to:",
        selectedDate.toLocaleTimeString()
      );
      setStatsTime(selectedDate);
      setStatsReminder(
        true,
        selectedDate.getHours(),
        selectedDate.getMinutes()
      );

      setTimeout(() => {
        scheduleAllReminders();
      }, 100);
    }
  };

  const handleMotivationTimeChange = async (
    event: any,
    selectedDate?: Date
  ) => {
    setShowMotivationTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      console.log(
        "📅 Motivation time changed to:",
        selectedDate.toLocaleTimeString()
      );
      setMotivationTime(selectedDate);
      setMotivationReminder(
        true,
        selectedDate.getHours(),
        selectedDate.getMinutes()
      );

      setTimeout(() => {
        scheduleAllReminders();
      }, 100);
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
                      onToggle={async (value) => {
                        setStatsPreferences(value, settings.includeAgeProgress);
                        setTimeout(() => {
                          scheduleAllReminders();
                        }, 100);
                      }}
                    />
                    <ToggleSection
                      label="Life Progress (%)"
                      description=""
                      value={settings.includeAgeProgress}
                      onToggle={async (value) => {
                        setStatsPreferences(settings.includeWeeksLived, value);
                        setTimeout(() => {
                          scheduleAllReminders();
                        }, 100);
                      }}
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
