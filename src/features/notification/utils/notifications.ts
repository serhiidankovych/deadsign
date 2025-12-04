import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type NotificationContentType = "stats" | "motivation" | "both";

export interface UserStats {
  weeksLived: number;
  totalWeeks: number;
  currentAge: number;
  percentageComplete?: number;
}

export interface NotificationDataPayload extends Record<string, unknown> {
  type?: string;
  notificationType?: NotificationContentType;
  stats?: UserStats;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const MOTIVATIONAL_QUOTES: string[] = [
  "Every week is a new opportunity to create the life you want.",
  "Time is precious. Make each week count.",
  "Your life is happening now. Don't wait for tomorrow.",
  "Each passing week is a reminder to live with purpose.",
  "Make your weeks matter. They're the building blocks of your legacy.",
  "Don't count the weeks, make the weeks count.",
  "Life is a collection of moments. Make them meaningful.",
  "The time you have is limited. Use it wisely.",
  "Every week lived is a gift. Make it count.",
  "Your future self will thank you for the choices you make today.",
  "Time flies, but you're the pilot.",
  "Life isn't about finding yourself, it's about creating yourself.",
  "The best time to start was yesterday. The next best time is now.",
  "Your life is your message to the world. Make it inspiring.",
  "Don't let the weeks pass by. Fill them with purpose.",
];

export function getRandomQuote(): string {
  return MOTIVATIONAL_QUOTES[
    Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
  ];
}

export function generateNotificationContent(
  type: NotificationContentType,
  stats?: UserStats,
  includeWeeksLived: boolean = true,
  includeTotalWeeks: boolean = true,
  includeAgeProgress: boolean = true
): { title: string; body: string } {
  const quote = getRandomQuote();

  if (type === "motivation") {
    return {
      title: "💪 Daily Motivation",
      body: quote,
    };
  }

  if (type === "stats" && stats) {
    const statsLines: string[] = [];

    if (includeWeeksLived) {
      statsLines.push(`📊 Weeks lived: ${stats.weeksLived.toLocaleString()}`);
    }

    if (includeTotalWeeks) {
      const weeksRemaining = stats.totalWeeks - stats.weeksLived;
      statsLines.push(`⏳ Weeks remaining: ${weeksRemaining.toLocaleString()}`);
    }

    if (includeAgeProgress && stats.percentageComplete !== undefined) {
      statsLines.push(
        `📈 Life progress: ${stats.percentageComplete.toFixed(1)}%`
      );
    }

    return {
      title: `🎯 Your Life Stats (Age ${stats.currentAge})`,
      body: statsLines.join("\n"),
    };
  }

  if (type === "both" && stats) {
    const statsLines: string[] = [];

    if (includeWeeksLived) {
      statsLines.push(`Weeks lived: ${stats.weeksLived.toLocaleString()}`);
    }

    if (includeAgeProgress && stats.percentageComplete !== undefined) {
      statsLines.push(`Progress: ${stats.percentageComplete.toFixed(1)}%`);
    }

    const statsText = statsLines.join(" • ");

    return {
      title: "💪 Daily Reminder",
      body: `${statsText}\n\n${quote}`,
    };
  }

  return {
    title: "💪 Daily Reminder",
    body: "Time for your daily motivation! Keep pushing forward.",
  };
}

export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token: string | undefined;

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
    } catch (e: unknown) {
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
  data: Record<string, unknown> = {}
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: "default",
    },
    trigger: null,
  });
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  notificationType: NotificationContentType = "both",
  stats?: UserStats,
  includeWeeksLived: boolean = true,
  includeTotalWeeks: boolean = true,
  includeAgeProgress: boolean = true,
  identifier?: string
): Promise<string> {
  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };

  const { title, body } = generateNotificationContent(
    notificationType,
    stats,
    includeWeeksLived,
    includeTotalWeeks,
    includeAgeProgress
  );

  const dataPayload: NotificationDataPayload = {
    type: identifier || "daily_reminder",
    notificationType,
    stats,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: dataPayload,
      sound: "default",
      ...(Platform.OS === "android" && {
        channelId: "daily-reminders",
      }),
    },
    trigger,
  });

  console.log(
    `✅ ${notificationType} reminder scheduled for ${hour}:${minute} - ID: ${notificationId}`
  );
  return notificationId;
}

export async function cancelDailyReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    const data = notification.content.data as NotificationDataPayload | null;
    const dataType = data?.type;

    if (
      dataType === "daily_reminder" ||
      dataType === "stats_reminder" ||
      dataType === "motivation_reminder"
    ) {
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
