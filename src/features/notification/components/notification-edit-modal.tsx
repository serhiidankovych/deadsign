import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CustomNotification,
  DayOfWeek,
  NotificationContent,
} from "../store/notification-store";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STAT_OPTIONS: {
  id: NotificationContent;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "weeksLived", label: "Weeks Lived", icon: "calendar-outline" },
  { id: "weeksRemaining", label: "Weeks Left", icon: "hourglass-outline" },
  { id: "ageProgress", label: "Life Progress", icon: "analytics-outline" },
  { id: "motivation", label: "Motivation", icon: "sparkles-outline" },
];

interface Props {
  visible: boolean;
  notification: CustomNotification | null;
  onClose: () => void;
  onSave: (data: Omit<CustomNotification, "id">) => void;
  onDelete?: (id: string) => void;
}

export function NotificationEditModal({
  visible,
  notification,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"custom" | "stats">("custom");
  const [stat, setStat] = useState<NotificationContent>("weeksLived");
  const [time, setTime] = useState(new Date());
  const [days, setDays] = useState<DayOfWeek[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [initialValues, setInitialValues] = useState({
    title: "",
    body: "",
    mode: "custom" as "custom" | "stats",
    stat: "weeksLived" as NotificationContent,
    time: new Date(),
    days: [] as DayOfWeek[],
    enabled: true,
  });

  useEffect(() => {
    if (visible) {
      const newTitle = notification?.title ?? "";
      const newBody = notification?.bodyText ?? "";
      const newMode = notification?.selectedContent ? "stats" : "custom";
      const newStat = notification?.selectedContent ?? "weeksLived";
      const newEnabled = notification?.enabled ?? true;
      const newDays = notification?.daysOfWeek ?? [];
      const t = new Date();
      if (notification) {
        t.setHours(notification.time.hour, notification.time.minute);
      }

      setTitle(newTitle);
      setBody(newBody);
      setMode(newMode);
      setStat(newStat);
      setEnabled(newEnabled);
      setDays(newDays);
      setTime(t);
      setHasChanges(false);

      setInitialValues({
        title: newTitle,
        body: newBody,
        mode: newMode,
        stat: newStat,
        time: t,
        days: newDays,
        enabled: newEnabled,
      });
    }
  }, [visible, notification]);

  useEffect(() => {
    if (!visible) return;

    const changed =
      title !== initialValues.title ||
      body !== initialValues.body ||
      mode !== initialValues.mode ||
      stat !== initialValues.stat ||
      enabled !== initialValues.enabled ||
      time.getHours() !== initialValues.time.getHours() ||
      time.getMinutes() !== initialValues.time.getMinutes() ||
      JSON.stringify(days) !== JSON.stringify(initialValues.days);

    setHasChanges(changed);
  }, [title, body, mode, stat, enabled, time, days, initialValues, visible]);

  const handleClose = () => {
    if (hasChanges) {
      Alert.alert("Unsaved Changes", "Discard changes?", [
        { text: "Keep Editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => onClose() },
        { text: "Save", onPress: () => handleSave() },
      ]);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      bodyText: mode === "custom" ? body : "",
      selectedContent: mode === "stats" ? stat : null,
      time: { hour: time.getHours(), minute: time.getMinutes() },
      daysOfWeek: days,
      enabled,
    });
  };

  const toggleDay = (index: number) => {
    const d = index as DayOfWeek;
    setDays((prev) =>
      prev.includes(d) ? prev.filter((i) => i !== d) : [...prev, d].sort(),
    );
  };

  const canSave = title.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={10}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {notification ? "Edit Reminder" : "New Reminder"}
          </Text>
          <Pressable
            onPress={handleSave}
            hitSlop={10}
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.5 }}
          >
            <Text style={styles.saveBtn}>Save</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.activeCard}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Reminder Active</Text>
                <Text style={styles.sublabel}>
                  {enabled
                    ? "Notifications are ON"
                    : "Notifications are PAUSED"}
                </Text>
              </View>
              <Pressable
                style={[styles.switch, enabled && styles.switchOn]}
                onPress={() => setEnabled(!enabled)}
                hitSlop={8}
              >
                <View
                  style={[styles.switchThumb, enabled && styles.switchThumbOn]}
                />
              </Pressable>
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Content Type</Text>

            <View style={styles.segmentedControl}>
              <Pressable
                style={[
                  styles.segBtn,
                  mode === "custom" && styles.segBtnActive,
                ]}
                onPress={() => setMode("custom")}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={
                    mode === "custom" ? Colors.background : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segText,
                    mode === "custom" && styles.segTextActive,
                  ]}
                >
                  Custom
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segBtn, mode === "stats" && styles.segBtnActive]}
                onPress={() => setMode("stats")}
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={18}
                  color={
                    mode === "stats" ? Colors.background : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segText,
                    mode === "stats" && styles.segTextActive,
                  ]}
                >
                  Life Stats
                </Text>
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="text-outline"
                size={20}
                color={Colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Reminder title (e.g. Daily Check-in)"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Colors.placeholder}
                maxLength={50}
              />
            </View>

            {mode === "custom" ? (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="chatbox-outline"
                  size={20}
                  color={Colors.textMuted}
                  style={[
                    styles.inputIcon,
                    { alignSelf: "flex-start", marginTop: 16 },
                  ]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder="What should the notification say?"
                  value={body}
                  onChangeText={setBody}
                  placeholderTextColor={Colors.placeholder}
                  maxLength={200}
                />
              </View>
            ) : (
              <View style={styles.statsGrid}>
                {STAT_OPTIONS.map((opt) => {
                  const isActive = stat === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      style={[
                        styles.statCard,
                        isActive && styles.statCardActive,
                      ]}
                      onPress={() => setStat(opt.id)}
                    >
                      <View
                        style={[
                          styles.iconCircle,
                          isActive && styles.iconCircleActive,
                        ]}
                      >
                        <Ionicons
                          name={opt.icon}
                          size={24}
                          color={
                            isActive ? Colors.background : Colors.textSecondary
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.statLabel,
                          isActive && styles.statLabelActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isActive && (
                        <View style={styles.checkmark}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={Colors.accentPrimary}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Schedule</Text>

            <Pressable
              style={styles.timeBtn}
              onPress={() => setShowPicker(true)}
            >
              <View style={styles.timeBtnContent}>
                <View style={styles.timeIconContainer}>
                  <Ionicons
                    name="time-outline"
                    size={24}
                    color={Colors.accentPrimary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timeLabel}>Notification Time</Text>
                  <Text style={styles.timeText}>
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textMuted}
                />
              </View>
            </Pressable>

            {showPicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, d) => {
                  setShowPicker(Platform.OS === "ios");
                  if (d) setTime(d);
                }}
              />
            )}

            <View style={styles.daysContainer}>
              <View style={styles.daysHeader}>
                <Text style={styles.daysLabel}>Repeat Days</Text>
                <Pressable onPress={() => setDays([])} hitSlop={8}>
                  <Text style={styles.clearDays}>Reset</Text>
                </Pressable>
              </View>
              <View style={styles.daysRow}>
                {DAYS.map((day, i) => (
                  <Pressable
                    key={day}
                    style={[
                      styles.dayChip,
                      days.includes(i as DayOfWeek) && styles.dayChipActive,
                    ]}
                    onPress={() => toggleDay(i)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        days.includes(i as DayOfWeek) &&
                          styles.dayChipTextActive,
                      ]}
                    >
                      {day.charAt(0)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {notification && (
            <Pressable
              style={styles.deleteBtn}
              onPress={() => onDelete?.(notification.id)}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
              <Text style={styles.deleteBtnText}>Delete Reminder</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: { fontWeight: "700", fontSize: 17, color: Colors.textPrimary },
  cancelBtn: { color: Colors.textSecondary, fontSize: 16 },
  saveBtn: { color: Colors.accentPrimary, fontSize: 16, fontWeight: "700" },
  content: { padding: 20, gap: 24, paddingBottom: 60 },
  activeCard: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  label: { fontSize: 16, fontWeight: "600", color: Colors.textPrimary },
  sublabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  section: { gap: 14 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  inputIcon: { marginLeft: 16 },
  input: { flex: 1, padding: 16, color: Colors.textPrimary, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: "top" },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: 4,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  segBtnActive: {
    backgroundColor: Colors.accentPrimary,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  segText: { color: Colors.textSecondary, fontWeight: "600", fontSize: 14 },
  segTextActive: { color: Colors.background, fontWeight: "700" },

  // Stats Grid Styles
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: "48.2%",
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    position: "relative",
  },
  statCardActive: {
    borderColor: Colors.accentPrimary,
    backgroundColor: Colors.accentPrimary + "08", // Light tint
    transform: [{ scale: 1.02 }],
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconCircleActive: { backgroundColor: Colors.accentPrimary },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
  },
  statLabelActive: { color: Colors.textPrimary, fontWeight: "700" },
  checkmark: { position: "absolute", top: 10, right: 10 },

  timeBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  timeBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.inputBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  timeText: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary },

  daysContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  daysHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  daysLabel: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  clearDays: { fontSize: 14, color: Colors.accentPrimary, fontWeight: "600" },
  daysRow: { flexDirection: "row", justifyContent: "space-between" },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayChipActive: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
  },
  dayChipText: { fontSize: 14, fontWeight: "700", color: Colors.textSecondary },
  dayChipTextActive: { color: Colors.background },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 18,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.error + "40",
  },
  deleteBtnText: { color: Colors.error, fontWeight: "700", fontSize: 16 },

  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: "center",
  },
  switchOn: { backgroundColor: Colors.accentPrimary },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  switchThumbOn: { transform: [{ translateX: 22 }] },
});
