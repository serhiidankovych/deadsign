import { useNotificationStore } from "@/src/features/notification/store/notification-store";
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  scheduleDailyReminder,
} from "@/src/features/notification/utils/notifications";
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
        if (notificationType === "daily_reminder") {
          console.log("Daily reminder tapped - you can navigate here");
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
    if (settings.enabled && settings.dailyReminderEnabled) {
      const scheduleReminder = async () => {
        try {
          await scheduleDailyReminder(
            settings.dailyReminderTime.hour,
            settings.dailyReminderTime.minute
          );
        } catch (error) {
          console.error("Error scheduling daily reminder:", error);
        }
      };

      scheduleReminder();
    }
  }, [
    settings.enabled,
    settings.dailyReminderEnabled,
    settings.dailyReminderTime.hour,
    settings.dailyReminderTime.minute,
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
