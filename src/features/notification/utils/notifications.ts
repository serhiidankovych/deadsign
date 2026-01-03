import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type NotificationContentType =
  | "weeksLived"
  | "weeksRemaining"
  | "ageProgress"
  | "motivation"
  | "none";

export interface UserStats {
  weeksLived: number;
  totalWeeks: number;
  currentAge: number;
  percentageComplete?: number;
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
  selectedContent: NotificationContentType,
  stats: UserStats | undefined,
  customTitle: string,
  customBody: string
): { title: string; body: string } {
  const finalTitle = customTitle.trim() || "Life Reframed";
  let contentSuffix = "";

  if (selectedContent === "motivation") {
    contentSuffix = getRandomQuote();
  } else if (stats) {
    if (selectedContent === "weeksLived") {
      contentSuffix = `📊 You have lived ${stats.weeksLived.toLocaleString()} weeks.`;
    } else if (selectedContent === "weeksRemaining") {
      const remaining = stats.totalWeeks - stats.weeksLived;
      contentSuffix = `⏳ ${remaining.toLocaleString()} weeks remaining in your journey.`;
    } else if (
      selectedContent === "ageProgress" &&
      stats.percentageComplete !== undefined
    ) {
      contentSuffix = `📈 Life progress: ${stats.percentageComplete.toFixed(
        1
      )}% complete.`;
    }
  }

  const userBody = customBody.trim();
  const bodyParts = [userBody, contentSuffix].filter(Boolean);
  const finalBody =
    bodyParts.length > 0
      ? "\n" + bodyParts.join("\n")
      : "\nTake a moment to reflect on your journey today.";

  return {
    title: finalTitle,
    body: finalBody,
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
    if (finalStatus !== "granted") return;
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (projectId) {
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      }
    } catch (e) {
      console.error("Error getting push token:", e);
    }
  }
  return token;
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  selectedContent: NotificationContentType,
  stats: UserStats | undefined,
  identifier: string,
  customTitle: string,
  customBody: string
): Promise<string> {
  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };

  const { title, body } = generateNotificationContent(
    selectedContent,
    stats,
    customTitle,
    customBody
  );

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        type: identifier || "custom_reminder",
        contentId: selectedContent,
      },
      sound: "default",
      ...(Platform.OS === "android" && { channelId: "daily-reminders" }),
    },
    trigger,
  });

  return notificationId;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
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
