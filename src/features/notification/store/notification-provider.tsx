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
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    };
    setupPermissions();
  }, []);

  useEffect(() => {
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setLastNotification(notification);
      }
    );

    responseListener.current = addNotificationResponseReceivedListener(
      (response) => {
        setLastNotificationResponse(response);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  useEffect(() => {
    const scheduleReminders = async () => {
      try {
        await cancelAllNotifications();

        if (!settings.enabled || !settings.customNotifications) {
          return;
        }

        let stats: UserStats | undefined;
        if (user) {
          stats = {
            weeksLived: user.weeksLived,
            totalWeeks: user.totalWeeks,
            currentAge: user.currentAge,
            percentageComplete: (user.weeksLived / user.totalWeeks) * 100,
          };
        }

        const activeNotifications = settings.customNotifications.filter(
          (n) => n.enabled
        );

        for (const notif of activeNotifications) {
          await scheduleDailyReminder(
            notif.time.hour,
            notif.time.minute,
            notif.selectedContent || "none",
            stats,
            notif.id,
            notif.title,
            notif.bodyText
          );
        }

        console.log(
          `✅ ${activeNotifications.length} custom notifications scheduled`
        );
      } catch (error) {
        console.error("❌ Error scheduling reminders:", error);
      }
    };

    scheduleReminders();
  }, [
    settings.enabled,
    settings.customNotifications,
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
