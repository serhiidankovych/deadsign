import { NotificationsScreenLayout } from "@/src/components/layout/notifications-screen-layout";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import {
  CustomNotification,
  useNotificationStore,
} from "@/src/features/notification/store/notification-store";
import { useUserStore } from "@/src/store/user-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

interface PresetTemplate {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  category: "stats" | "milestone" | "motivation";
  notification: Omit<CustomNotification, "id">;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "morning-progress",
    title: "Morning Progress Check",
    description: "Start your day with your life progress stats",
    icon: "sunny-outline",
    iconColor: "#F59E0B",
    category: "stats",
    notification: {
      title: "Good Morning! 🌅",
      bodyText: "",
      selectedContent: "ageProgress",
      time: { hour: 8, minute: 0 },
      daysOfWeek: [1, 2, 3, 4, 5],
      enabled: true,
    },
  },
  {
    id: "weekly-reflection",
    title: "Weekly Life Reflection",
    description: "Sunday reminder to reflect on your weeks",
    icon: "calendar-outline",
    iconColor: "#8B5CF6",
    category: "stats",
    notification: {
      title: "Weekly Reflection 📊",
      bodyText: "",
      selectedContent: "weeksLived",
      time: { hour: 19, minute: 0 },
      daysOfWeek: [0],
      enabled: true,
    },
  },
  {
    id: "evening-motivation",
    title: "Evening Motivation",
    description: "End your day with an inspiring message",
    icon: "moon-outline",
    iconColor: "#6366F1",
    category: "motivation",
    notification: {
      title: "Evening Reflection 🌙",
      bodyText: "",
      selectedContent: "motivation",
      time: { hour: 20, minute: 0 },
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
    },
  },
  {
    id: "time-remaining",
    title: "Time Awareness",
    description: "Daily reminder of weeks remaining",
    icon: "hourglass-outline",
    iconColor: "#EF4444",
    category: "stats",
    notification: {
      title: "Make Today Count ⏳",
      bodyText: "",
      selectedContent: "weeksRemaining",
      time: { hour: 12, minute: 0 },
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
    },
  },

  {
    id: "birthday-reminder",
    title: "Birthday Countdown",
    description: "Get notified 1 day before your birthday",
    icon: "gift-outline",
    iconColor: "#EC4899",
    category: "milestone",
    notification: {
      title: "Birthday Tomorrow! 🎂",
      bodyText:
        "Your special day is almost here. How will you celebrate another year of life?",
      selectedContent: null,
      time: { hour: 9, minute: 0 },
      daysOfWeek: [],
      enabled: true,
    },
  },
  {
    id: "monday-motivation",
    title: "Monday Fresh Start",
    description: "Motivational boost every Monday morning",
    icon: "flash-outline",
    iconColor: "#10B981",
    category: "motivation",
    notification: {
      title: "New Week, New Opportunities 💪",
      bodyText: "It's Monday! Start this week with intention and purpose.",
      selectedContent: null,
      time: { hour: 7, minute: 30 },
      daysOfWeek: [1],
      enabled: true,
    },
  },
  {
    id: "midweek-check",
    title: "Midweek Check-in",
    description: "Wednesday reminder to stay on track",
    icon: "checkmark-circle-outline",
    iconColor: "#06B6D4",
    category: "motivation",
    notification: {
      title: "Halfway There! 🎯",
      bodyText:
        "It's Wednesday. Review your week's goals and adjust if needed.",
      selectedContent: null,
      time: { hour: 18, minute: 0 },
      daysOfWeek: [3],
      enabled: true,
    },
  },
  {
    id: "weekend-planning",
    title: "Weekend Planner",
    description: "Friday reminder to plan meaningful weekend",
    icon: "map-outline",
    iconColor: "#F97316",
    category: "motivation",
    notification: {
      title: "Weekend Ahead 🌟",
      bodyText:
        "How will you make this weekend count? Plan something meaningful.",
      selectedContent: null,
      time: { hour: 17, minute: 0 },
      daysOfWeek: [5],
      enabled: true,
    },
  },
];

export default function NotificationPresetsScreen() {
  const { addCustomNotification } = useNotificationStore();
  const { user } = useUserStore();

  const handleSelectPreset = (preset: PresetTemplate) => {
    if (preset.id === "birthday-reminder" && user) {
      const today = new Date();
      const dob = new Date(user.dateOfBirth);
      const nextBirthday = new Date(
        today.getFullYear(),
        dob.getMonth(),
        dob.getDate(),
      );
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }

      const dayBefore = new Date(nextBirthday);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const dayOfWeek = dayBefore.getDay();

      Alert.alert(
        "Add Birthday Reminder?",
        `This will send a reminder on ${dayBefore.toLocaleDateString()} (${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek]}) at 9:00 AM.\n\nNote: You'll need to manually update this after your birthday for next year.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Reminder",
            onPress: () => {
              addCustomNotification({
                ...preset.notification,
                daysOfWeek: [dayOfWeek as any],
              });
              router.back();
            },
          },
        ],
      );
      return;
    }

    Alert.alert("Add Preset?", `Add "${preset.title}" to your reminders?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Add",
        onPress: () => {
          addCustomNotification(preset.notification);
          router.back();
        },
      },
    ]);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "stats":
        return Colors.accentPrimary;
      case "milestone":
        return "#EC4899";
      case "motivation":
        return "#10B981";
      default:
        return Colors.textSecondary;
    }
  };

  const categorizedPresets = {
    stats: PRESET_TEMPLATES.filter((p) => p.category === "stats"),
    milestone: PRESET_TEMPLATES.filter((p) => p.category === "milestone"),
    motivation: PRESET_TEMPLATES.filter((p) => p.category === "motivation"),
  };

  return (
    <NotificationsScreenLayout title="Notification Presets" scrollEnabled>
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="sparkles"
                size={24}
                color={Colors.accentPrimary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Quick Start Templates</Text>
              <Text style={styles.headerSubtitle}>
                Choose from pre-configured reminders to get started instantly
              </Text>
            </View>
          </View>
        </Card>

        {/* Stats-based Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: getCategoryColor("stats") },
              ]}
            />
            <Text style={styles.sectionTitle}>Life Statistics</Text>
          </View>
          {categorizedPresets.stats.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onPress={() => handleSelectPreset(preset)}
            />
          ))}
        </View>

        {/* Milestones Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: getCategoryColor("milestone") },
              ]}
            />
            <Text style={styles.sectionTitle}>Special Moments</Text>
          </View>
          {categorizedPresets.milestone.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onPress={() => handleSelectPreset(preset)}
            />
          ))}
        </View>

        {/* Motivation Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: getCategoryColor("motivation") },
              ]}
            />
            <Text style={styles.sectionTitle}>Daily Motivation</Text>
          </View>
          {categorizedPresets.motivation.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onPress={() => handleSelectPreset(preset)}
            />
          ))}
        </View>
      </View>
    </NotificationsScreenLayout>
  );
}

function PresetCard({
  preset,
  onPress,
}: {
  preset: PresetTemplate;
  onPress: () => void;
}) {
  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const getDaysText = (days: number[]) => {
    if (days.length === 0) return "Custom schedule";
    if (days.length === 7) return "Every day";
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((d) => dayNames[d]).join(", ");
  };

  return (
    <Pressable style={styles.presetCard} onPress={onPress}>
      <View
        style={[
          styles.presetIcon,
          { backgroundColor: preset.iconColor + "15" },
        ]}
      >
        <Ionicons name={preset.icon} size={28} color={preset.iconColor} />
      </View>

      <View style={styles.presetContent}>
        <Text style={styles.presetTitle}>{preset.title}</Text>
        <Text style={styles.presetDescription}>{preset.description}</Text>

        <View style={styles.presetMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>
              {formatTime(
                preset.notification.time.hour,
                preset.notification.time.minute,
              )}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.textMuted}
            />
            <Text style={styles.metaText}>
              {getDaysText(preset.notification.daysOfWeek)}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons
        name="add-circle"
        size={24}
        color={Colors.accentPrimary}
        style={styles.addIcon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
  },
  headerCard: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentPrimary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
  },
  presetIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  presetContent: {
    flex: 1,
    gap: 4,
  },
  presetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  presetDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  presetMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  addIcon: {
    opacity: 0.6,
  },
});
