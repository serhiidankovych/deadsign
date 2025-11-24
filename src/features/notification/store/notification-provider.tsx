import { useNotificationStore } from "@/src/features/notification/store/notification-store";
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  cancelAllNotifications,
  scheduleDailyReminder,
  UserStats,
} from "@/src/features/notification/utils/notifications";
import { useUserStore } from "@/src/store/user-store";

import * as Notifications from "expo-notifications";
import React, { createContext, useContext, useEffect, useRef } from "react";

interface NotificationContextValue {
  lastNotification: Notifications.Notification | undefined;
  lastNotificationResponse: Notifications.NotificationResponse | undefined;
}

const NotificationContext = createContext<NotificationContextValue>({
  lastNotification: undefined,
  lastNotificationResponse: undefined,
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { settings } = useNotificationStore();
  const { user } = useUserStore();

  const [lastNotification, setLastNotification] =
    React.useState<Notifications.Notification>();
  const [lastNotificationResponse, setLastNotificationResponse] =
    React.useState<Notifications.NotificationResponse>();

  const notificationListener = useRef<
    Notifications.EventSubscription | undefined
  >(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined
  );

  useEffect(() => {
    const setupPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      console.log("Current permission status:", status);

      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        console.log("Permission request result:", newStatus);

        if (newStatus !== "granted") {
          console.warn("⚠️ Notification permissions denied by user");
        }
      }
    };

    setupPermissions();
  }, []);

  useEffect(() => {
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        console.log("📬 Notification received:", notification);
        setLastNotification(notification);
      }
    );

    responseListener.current = addNotificationResponseReceivedListener(
      (response) => {
        console.log("👆 Notification tapped:", response);
        setLastNotificationResponse(response);

        const notificationType =
          response.notification.request.content.data?.type;

        if (
          notificationType === "stats_reminder" ||
          notificationType === "motivation_reminder"
        ) {
          console.log(`${notificationType} tapped - you can navigate here`);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (
      !settings.enabled ||
      !settings.statsReminderTime ||
      !settings.motivationReminderTime
    ) {
      return;
    }

    const scheduleReminders = async () => {
      try {
        await cancelAllNotifications();

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
          const id = await scheduleDailyReminder(
            settings.statsReminderTime.hour,
            settings.statsReminderTime.minute,
            "stats",
            stats,
            settings.includeWeeksLived,
            false,
            settings.includeAgeProgress,
            "stats_reminder"
          );
          console.log("📊 Stats reminder scheduled:", id);
        }

        if (settings.motivationReminderEnabled) {
          const id = await scheduleDailyReminder(
            settings.motivationReminderTime.hour,
            settings.motivationReminderTime.minute,
            "motivation",
            undefined,
            false,
            false,
            false,
            "motivation_reminder"
          );
          console.log("💪 Motivation reminder scheduled:", id);
        }

        console.log("✅ All notifications scheduled successfully");
      } catch (error) {
        console.error("❌ Error scheduling reminders:", error);
      }
    };

    scheduleReminders();
  }, [
    settings.enabled,
    settings.statsReminderEnabled,
    settings.statsReminderTime?.hour,
    settings.statsReminderTime?.minute,
    settings.motivationReminderEnabled,
    settings.motivationReminderTime?.hour,
    settings.motivationReminderTime?.minute,
    settings.includeWeeksLived,
    settings.includeAgeProgress,
    user?.weeksLived,
    user?.totalWeeks,
    user?.currentAge,
  ]);

  const value: NotificationContextValue = {
    lastNotification,
    lastNotificationResponse,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
