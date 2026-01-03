import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { ToggleSection } from "@/src/features/notification/components/toggle-section";
import {
  CustomNotification,
  DayOfWeek,
  NotificationContent,
  useNotificationStore,
} from "@/src/features/notification/store/notification-store";
import {
  cancelAllNotifications,
  scheduleDailyReminder,
  UserStats,
} from "@/src/features/notification/utils/notifications";
import { useUserStore } from "@/src/store/user-store";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CONTENT_OPTIONS: {
  id: NotificationContent;
  label: string;
  emoji: string;
}[] = [
  { id: "weeksLived", label: "Weeks Lived", emoji: "📊" },
  { id: "weeksRemaining", label: "Weeks Remaining", emoji: "⏳" },
  { id: "ageProgress", label: "Life Progress %", emoji: "📈" },
  { id: "motivation", label: "Random Motivation", emoji: "✨" },
];

export default function NotificationSettingsScreen() {
  const {
    settings,
    setEnabled,
    addCustomNotification,
    updateCustomNotification,
    deleteCustomNotification,
  } = useNotificationStore();

  const { user } = useUserStore();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [fadeAnim] = useState(new Animated.Value(settings.enabled ? 1 : 0.5));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<CustomNotification | null>(null);

  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [selectedContent, setSelectedContent] =
    useState<NotificationContent>(null);
  const [customTime, setCustomTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);

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
      const customNotifications = currentSettings.customNotifications || [];

      await cancelAllNotifications();
      if (!currentSettings.enabled) return;

      let stats: UserStats | undefined;
      if (currentUser) {
        stats = {
          weeksLived: currentUser.weeksLived,
          totalWeeks: currentUser.totalWeeks,
          currentAge: currentUser.currentAge,
          percentageComplete:
            (currentUser.weeksLived / currentUser.totalWeeks) * 100,
        };
      }

      for (const notif of customNotifications) {
        if (notif.enabled) {
          await scheduleDailyReminder(
            notif.time.hour,
            notif.time.minute,
            notif.selectedContent || "none",
            stats,
            notif.id,
            notif.title,
            notif.bodyText || ""
          );
        }
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setEnabled(value);
    if (!value) await cancelAllNotifications();
    else setTimeout(() => scheduleAllReminders(), 100);
  };

  const openCreateModal = () => {
    setCustomTitle("");
    setCustomBody("");
    setSelectedContent(null);
    setCustomTime(new Date());
    setSelectedDays([]);
    setEditingNotification(null);
    setShowCreateModal(true);
  };

  const openEditModal = (notification: CustomNotification) => {
    setCustomTitle(notification.title);
    setCustomBody(notification.bodyText || "");
    setSelectedContent(notification.selectedContent);
    const time = new Date();
    time.setHours(notification.time.hour);
    time.setMinutes(notification.time.minute);
    setCustomTime(time);
    setSelectedDays(notification.daysOfWeek);
    setEditingNotification(notification);
    setShowCreateModal(true);
  };

  const handleSaveCustomNotification = () => {
    if (!customTitle.trim()) return;

    const notificationData: Omit<CustomNotification, "id"> = {
      title: customTitle,
      bodyText: customBody,
      enabled: editingNotification?.enabled ?? true,
      time: { hour: customTime.getHours(), minute: customTime.getMinutes() },
      selectedContent,
      daysOfWeek: selectedDays,
    };

    if (editingNotification) {
      updateCustomNotification(editingNotification.id, notificationData);
    } else {
      addCustomNotification(notificationData);
    }

    setShowCreateModal(false);
    setTimeout(() => scheduleAllReminders(), 100);
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
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
            description="Manage your custom life reminders"
            value={settings.enabled}
            onToggle={handleToggleNotifications}
          />
        </Card>

        <Animated.View style={[{ opacity: fadeAnim }]}>
          <View style={styles.gridContainer}>
            <Pressable
              style={styles.createTile}
              onPress={openCreateModal}
              disabled={!settings.enabled}
            >
              <View style={styles.createTileContent}>
                <Ionicons
                  name="add-circle"
                  size={40}
                  color={Colors.accentPrimary}
                />
                <Text style={styles.createTileText}>Create New</Text>
              </View>
            </Pressable>

            {(settings.customNotifications || []).map((notification) => (
              <Pressable
                key={notification.id}
                style={[
                  styles.notificationTile,
                  !notification.enabled && styles.notificationTileDisabled,
                ]}
                onPress={() => openEditModal(notification)}
                disabled={!settings.enabled}
              >
                <View style={styles.notificationTileHeader}>
                  <Text style={styles.notificationTileTitle} numberOfLines={1}>
                    {notification.title}
                  </Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      updateCustomNotification(notification.id, {
                        enabled: !notification.enabled,
                      });
                      setTimeout(() => scheduleAllReminders(), 100);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={
                        notification.enabled
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={22}
                      color={
                        notification.enabled
                          ? Colors.accentPrimary
                          : Colors.textSecondary
                      }
                    />
                  </Pressable>
                </View>
                <Text style={styles.notificationTileTime}>
                  {formatTime(notification.time.hour, notification.time.minute)}
                </Text>
                <View style={styles.notificationTileFooter}>
                  <Text style={styles.notificationTileDays} numberOfLines={1}>
                    {notification.daysOfWeek.length > 0
                      ? notification.daysOfWeek.map((d) => DAYS[d]).join(", ")
                      : "Every day"}
                  </Text>
                  {!notification.enabled && (
                    <View style={styles.disabledBadge}>
                      <Text style={styles.disabledBadgeText}>OFF</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text variant="subtitle" style={styles.modalTitle}>
              {editingNotification ? "Edit" : "New"} Reminder
            </Text>
            <Pressable onPress={handleSaveCustomNotification}>
              <Text style={styles.modalSave}>Save</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Card>
              <View style={styles.toggleContainer}>
                <View style={styles.toggleLabelContainer}>
                  <Text style={styles.toggleLabel}>Enable This Reminder</Text>
                  <Text style={styles.toggleDescription}>
                    Turn off to pause without deleting
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.toggle,
                    (editingNotification?.enabled ?? true) &&
                      styles.toggleActive,
                  ]}
                  onPress={() => {
                    if (editingNotification) {
                      setEditingNotification({
                        ...editingNotification,
                        enabled: !editingNotification.enabled,
                      });
                    }
                  }}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      (editingNotification?.enabled ?? true) &&
                        styles.toggleThumbActive,
                    ]}
                  />
                </Pressable>
              </View>
            </Card>

            <Card>
              <Text style={styles.sectionLabel}>Notification Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Stay Focused"
                placeholderTextColor={Colors.placeholder}
                value={customTitle}
                onChangeText={setCustomTitle}
              />

              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
                Custom Message
              </Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                placeholder="Enter the text to display in the notification body..."
                placeholderTextColor={Colors.placeholder}
                value={customBody}
                onChangeText={setCustomBody}
              />
            </Card>

            <Card>
              <Text style={styles.sectionLabel}>
                Include Content (Select One)
              </Text>
              <View style={styles.chipContainer}>
                {CONTENT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.chip,
                      selectedContent === opt.id && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setSelectedContent(
                        selectedContent === opt.id ? null : opt.id
                      )
                    }
                  >
                    <Text style={styles.chipEmoji}>{opt.emoji}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        selectedContent === opt.id && styles.chipTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            <Card>
              <Text style={styles.sectionLabel}>Time & Schedule</Text>
              <Pressable
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Colors.textPrimary}
                />
                <Text style={styles.timeButtonText}>
                  {formatTime(customTime.getHours(), customTime.getMinutes())}
                </Text>
              </Pressable>
              {showTimePicker && (
                <DateTimePicker
                  value={customTime}
                  mode="time"
                  is24Hour={false}
                  onChange={(e, d) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (d) setCustomTime(d);
                  }}
                />
              )}
              <View style={[styles.daysContainer, { marginTop: 16 }]}>
                {DAYS.map((day, i) => (
                  <Pressable
                    key={i}
                    style={[
                      styles.dayChip,
                      selectedDays.includes(i as DayOfWeek) &&
                        styles.dayChipSelected,
                    ]}
                    onPress={() => toggleDay(i as DayOfWeek)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        selectedDays.includes(i as DayOfWeek) &&
                          styles.dayChipTextSelected,
                      ]}
                    >
                      {day[0]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            {editingNotification && (
              <Pressable
                style={styles.deleteButton}
                onPress={() => {
                  deleteCustomNotification(editingNotification.id);
                  setShowCreateModal(false);
                  setTimeout(() => scheduleAllReminders(), 100);
                }}
              >
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                <Text style={styles.deleteButtonText}>Delete Reminder</Text>
              </Pressable>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  closeButton: { padding: 8 },
  title: { color: Colors.textPrimary },
  placeholder: { width: 40 },
  scrollContent: { padding: 20, gap: 16 },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  createTile: {
    width: "48%",
    aspectRatio: 1.1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.accentPrimary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  createTileContent: { alignItems: "center", gap: 8 },
  createTileText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.accentPrimary,
  },
  notificationTile: {
    width: "48%",
    aspectRatio: 1.1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    justifyContent: "space-between",
  },
  notificationTileDisabled: { opacity: 0.5 },
  notificationTileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  notificationTileTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  notificationTileTime: {
    fontSize: 16,
    color: Colors.accentPrimary,
    fontWeight: "700",
  },
  notificationTileDays: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  notificationTileFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  disabledBadge: {
    backgroundColor: Colors.error + "20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  disabledBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.error,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  toggleLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: Colors.borderLight,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: Colors.accentPrimary,
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalCancel: { color: Colors.textSecondary, fontSize: 16 },
  modalTitle: { fontWeight: "700", color: Colors.textPrimary },
  modalSave: { color: Colors.accentPrimary, fontWeight: "700", fontSize: 16 },
  modalContent: { padding: 20, gap: 16 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    textAlignVertical: "top",
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipSelected: {
    backgroundColor: Colors.selectedBackground,
    borderColor: Colors.accentPrimary,
  },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, color: Colors.textSecondary },
  chipTextSelected: { color: Colors.accentPrimary, fontWeight: "700" },
  daysContainer: { flexDirection: "row", justifyContent: "space-between" },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dayChipSelected: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
  },
  dayChipText: { fontSize: 14, fontWeight: "700", color: Colors.textSecondary },
  dayChipTextSelected: { color: "#FFF" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderColor: Colors.error,
    marginTop: 20,
  },
  deleteButtonText: { color: Colors.error, fontWeight: "700" },
});
