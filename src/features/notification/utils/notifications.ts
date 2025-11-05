import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-reminders", {
      name: "Daily Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FAFF00",
      sound: "default",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Failed to get push notification permissions");
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.warn("Project ID not found for push notifications");
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log("📱 Expo Push Token:", token);
    } catch (e) {
      console.error("Error getting push token:", e);
    }
  } else {
    console.warn("Must use physical device for Push Notifications");
  }

  return token;
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: "default",
    },
    trigger: null,
  });
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<string> {
  await cancelDailyReminders();

  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💪 Daily Reminder",
      body: "Time for your daily motivation! Keep pushing forward.",
      data: { type: "daily_reminder" },
      sound: "default",
      ...(Platform.OS === "android" && {
        channelId: "daily-reminders",
      }),
    },
    trigger,
  });

  console.log(
    `✅ Daily reminder scheduled for ${hour}:${minute} - ID: ${notificationId}`
  );
  return notificationId;
}

export async function cancelDailyReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.type === "daily_reminder") {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("🗑️ All notifications cancelled");
}

export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

export async function clearAllDeliveredNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}
