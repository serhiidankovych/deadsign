import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

import { useNotificationStore } from "@/src/features/notification/store/notification-store";
import {
  cancelAllNotifications,
  getScheduledNotifications,
  registerForPushNotificationsAsync,
  scheduleDailyReminder,
  sendLocalNotification,
} from "@/src/features/notification/utils/notifications";

import { styles } from "./notification-settings.styles";
import { TimePickerSection } from "./time-picker-section";
import { ToggleSection } from "./toggle-section";

export function NotificationSettings() {
  const { settings, setEnabled, setDailyReminder, setPushToken } =
    useNotificationStore();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    const date = new Date();
    date.setHours(settings.dailyReminderTime.hour);
    date.setMinutes(settings.dailyReminderTime.minute);
    setTempTime(date);
  }, [settings.dailyReminderTime]);

  const handleToggleNotifications = async (value: boolean) => {
    setEnabled(value);

    if (value) {
      const token = await registerForPushNotificationsAsync();
      setPushToken(token);

      if (settings.dailyReminderEnabled) {
        await scheduleDailyReminder(
          settings.dailyReminderTime.hour,
          settings.dailyReminderTime.minute
        );
      }
    } else {
      await cancelAllNotifications();
    }
  };

  const handleToggleDailyReminder = async (value: boolean) => {
    setDailyReminder(value);

    if (value && settings.enabled) {
      await scheduleDailyReminder(
        settings.dailyReminderTime.hour,
        settings.dailyReminderTime.minute
      );
    } else {
      await cancelAllNotifications();
    }
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);

    if (selectedDate) {
      setTempTime(selectedDate);
      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();

      setDailyReminder(settings.dailyReminderEnabled, hour, minute);

      if (settings.enabled && settings.dailyReminderEnabled) {
        await scheduleDailyReminder(hour, minute);
      }
    }

    if (Platform.OS === "ios") setShowTimePicker(false);
  };

  const handleTestNotification = async () => {
    await sendLocalNotification(
      "Test Notification ✅",
      "Your notifications are working perfectly!"
    );
  };

  const handleViewScheduled = async () => {
    const scheduled = await getScheduledNotifications();
    console.log("📅 Scheduled notifications:", scheduled);

    if (scheduled.length === 0) {
      await sendLocalNotification(
        "No Scheduled Notifications",
        "You don't have any scheduled notifications."
      );
    } else {
      const dailyReminder = scheduled.find(
        (notif) => notif.content.data?.type === "daily_reminder"
      );

      if (dailyReminder && dailyReminder.trigger) {
        const trigger = dailyReminder.trigger as any;
        const hour = trigger.hour ?? settings.dailyReminderTime.hour;
        const minute = trigger.minute ?? settings.dailyReminderTime.minute;

        await sendLocalNotification(
          "Daily Reminder Scheduled ✅",
          `Next notification at ${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        await sendLocalNotification(
          "Scheduled Notifications",
          `You have ${scheduled.length} notification(s) scheduled.`
        );
      }
    }
  };

  return (
    <Card style={styles.container}>
      <Text variant="subtitle" style={styles.title}>
        Notifications
      </Text>

      <ToggleSection
        label="Enable Notifications"
        description="Receive reminders and updates"
        value={settings.enabled}
        onToggle={handleToggleNotifications}
      />

      {settings.enabled && (
        <>
          <ToggleSection
            label="Daily Reminder"
            description="Get a daily motivation"
            value={settings.dailyReminderEnabled}
            onToggle={handleToggleDailyReminder}
          />

          {settings.dailyReminderEnabled && (
            <TimePickerSection
              time={tempTime}
              showPicker={showTimePicker}
              onOpenPicker={() => setShowTimePicker(true)}
              onChange={handleTimeChange}
            />
          )}

          {/* <ActionButtons
            onTest={handleTestNotification}
            onViewScheduled={handleViewScheduled}
          /> */}
        </>
      )}
    </Card>
  );
}
