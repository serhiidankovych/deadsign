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
  const { settings, checkPermissionStatus } = useNotificationStore();
  const { user } = useUserStore();

  const [lastNotification, setLastNotification] =
    React.useState<Notifications.Notification>();
  const [lastNotificationResponse, setLastNotificationResponse] =
    React.useState<Notifications.NotificationResponse>();

  const notificationListener = useRef<
    Notifications.EventSubscription | undefined
  >(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined,
  );

  const schedulingInProgress = useRef(false);
  const lastScheduledHash = useRef<string>("");

  useEffect(() => {
    checkPermissionStatus();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        checkPermissionStatus();
      },
    );

    return () => {
      subscription.remove();
    };
  }, [checkPermissionStatus]);

  useEffect(() => {
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setLastNotification(notification);
      },
    );

    responseListener.current = addNotificationResponseReceivedListener(
      (response) => {
        setLastNotificationResponse(response);
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  useEffect(() => {
    const scheduleReminders = async () => {
      if (schedulingInProgress.current) {
        console.log("⏳ Scheduling already in progress, skipping...");
        return;
      }

      if (!settings.enabled) {
        console.log("🔕 Notifications disabled");
        return;
      }

      try {
        schedulingInProgress.current = true;

        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          console.log("⚠️ Notification permissions not granted");

          await checkPermissionStatus();
          return;
        }

        const currentHash = JSON.stringify({
          enabled: settings.enabled,
          notifications: settings.customNotifications?.map((n) => ({
            id: n.id,
            enabled: n.enabled,
            time: n.time,
            daysOfWeek: n.daysOfWeek,
            content: n.selectedContent,
            title: n.title,
            body: n.bodyText,
          })),
          userWeeks: user?.weeksLived,
        });

        if (currentHash === lastScheduledHash.current) {
          console.log("📋 No changes detected, skipping scheduling");
          return;
        }

        lastScheduledHash.current = currentHash;

        await cancelAllNotifications();

        if (!settings.customNotifications) {
          console.log("🔕 No custom notifications");
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
          (n) => n.enabled,
        );

        for (const notif of activeNotifications) {
          const notificationId = await scheduleDailyReminder(
            notif.time.hour,
            notif.time.minute,
            notif.selectedContent || "none",
            stats,
            notif.id,
            notif.title,
            notif.bodyText,
          );

          console.log(
            `📅 Scheduled: "${notif.title}" at ${notif.time.hour}:${notif.time.minute} (ID: ${notificationId})`,
          );
        }

        console.log(
          `✅ ${activeNotifications.length} custom notification(s) scheduled successfully`,
        );
      } catch (error) {
        console.error("❌ Error scheduling reminders:", error);
      } finally {
        schedulingInProgress.current = false;
      }
    };

    const timeoutId = setTimeout(scheduleReminders, 500);
    return () => clearTimeout(timeoutId);
  }, [
    settings.enabled,
    settings.customNotifications,
    user?.weeksLived,
    user?.totalWeeks,
    user?.currentAge,
    checkPermissionStatus,
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
