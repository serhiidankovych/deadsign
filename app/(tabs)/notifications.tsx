import { NotificationsScreenLayout } from "@/src/components/layout/notifications-screen-layout";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { NotificationEditModal } from "@/src/features/notification/components/notification-edit-modal";
import {
  CustomNotification,
  useNotificationStore,
} from "@/src/features/notification/store/notification-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STAT_INFO: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  weeksLived: { label: "Weeks Lived", icon: "calendar" },
  weeksRemaining: { label: "Weeks Left", icon: "hourglass" },
  ageProgress: { label: "Life Progress", icon: "analytics" },
  motivation: { label: "Motivation", icon: "sparkles" },
};

export default function NotificationsScreen() {
  const {
    settings,
    setEnabled,
    addCustomNotification,
    updateCustomNotification,
    deleteCustomNotification,
  } = useNotificationStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<CustomNotification | null>(
    null,
  );

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const onOpenEdit = (n?: CustomNotification) => {
    setSelectedNotif(n ?? null);
    setModalVisible(true);
  };

  const handleToggleNotifications = async () => {
    if (!settings.enabled) {
      const success = await setEnabled(true);

      if (!success) {
        Alert.alert(
          "Permission Required",
          "Notifications permission is required to receive reminders. Please enable notifications in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
      }
    } else {
      await setEnabled(false);
    }
  };

  return (
    <NotificationsScreenLayout title="Notifications" scrollEnabled={false}>
      <View style={styles.fixedHeaderWrapper}>
        <View style={styles.fixedHeader}>
          <Card style={styles.topCard}>
            <View style={styles.globalRow}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="notifications"
                  size={22}
                  color={Colors.accentPrimary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.globalTitle}>Push Notifications</Text>
                <Text style={styles.globalSub}>Master alert settings</Text>
              </View>

              <Pressable
                style={[styles.switch, settings.enabled && styles.switchOn]}
                onPress={handleToggleNotifications}
              >
                <View
                  style={[
                    styles.switchThumb,
                    settings.enabled && styles.switchThumbOn,
                  ]}
                />
              </Pressable>
            </View>
          </Card>

          {!settings.enabled && (
            <View style={styles.disabledBanner}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.disabledText}>
                {settings.permissionStatus === "denied"
                  ? "Notification permission denied. Tap the switch to enable."
                  : "Notifications are currently disabled"}
              </Text>
            </View>
          )}

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Your Reminders</Text>
          </View>
        </View>
      </View>

      <View style={styles.listWrapper}>
        <FlatList
          data={settings.customNotifications}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={Colors.border}
              />
              <Text style={styles.emptyTitle}>No reminders yet</Text>
              <Text style={styles.emptySub}>Create your first reminder</Text>
            </View>
          }
          renderItem={({ item: n }) => {
            const isStat = !!n.selectedContent;
            const statDetail = n.selectedContent
              ? STAT_INFO[n.selectedContent]
              : null;

            return (
              <Pressable
                style={[styles.tile, !n.enabled && styles.tileDisabled]}
                onPress={() => onOpenEdit(n)}
              >
                <View style={styles.tileBgIcon}>
                  <Ionicons
                    name={
                      isStat ? statDetail?.icon : "chatbubble-ellipses-outline"
                    }
                    size={60}
                    color={Colors.border}
                    style={{ opacity: 0.15 }}
                  />
                </View>

                <View style={styles.tileHeader}>
                  <View
                    style={[
                      styles.statusPill,
                      !n.enabled && styles.statusPillInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        !n.enabled && styles.statusTextInactive,
                      ]}
                    >
                      {n.enabled ? "ACTIVE" : "PAUSED"}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={styles.tileTitle} numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text style={styles.tileTime}>
                    {formatTime(n.time.hour, n.time.minute)}
                  </Text>
                </View>

                <View style={styles.tileFooter}>
                  <Text style={styles.dayText}>
                    {n.daysOfWeek.length === 0 || n.daysOfWeek.length === 7
                      ? "Every day"
                      : n.daysOfWeek.map((d) => DAYS[d][0]).join(", ")}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      </View>

      <NotificationEditModal
        visible={modalVisible}
        notification={selectedNotif}
        onClose={() => setModalVisible(false)}
        onSave={(data) => {
          selectedNotif
            ? updateCustomNotification(selectedNotif.id, data)
            : addCustomNotification(data);
          setModalVisible(false);
        }}
        onDelete={(id) => {
          deleteCustomNotification(id);
          setModalVisible(false);
        }}
      />

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          !settings.enabled && styles.fabDisabled,
          pressed && styles.fabPressed,
        ]}
        onPress={() => onOpenEdit()}
        disabled={!settings.enabled}
      >
        <Ionicons name="add" size={22} color={Colors.background} />
        <Text style={styles.fabText}>Add reminder</Text>
      </Pressable>
    </NotificationsScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fixedHeaderWrapper: {
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  fixedHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  listWrapper: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },
  list: {
    flex: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  globalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentPrimary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  globalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  globalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  disabledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  disabledText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  listHeader: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: Colors.border + "40",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  tile: {
    width: "48.5%",
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  tileDisabled: {
    opacity: 0.6,
    backgroundColor: Colors.inputBackground,
  },
  tileBgIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  tileHeader: { flexDirection: "row" },
  statusPill: {
    backgroundColor: Colors.success + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.success + "30",
  },
  statusPillInactive: {
    backgroundColor: Colors.border,
    borderColor: "transparent",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.success,
  },
  statusTextInactive: {
    color: Colors.textMuted,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  tileTime: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.textPrimary,
  },
  tileFooter: { gap: 6 },
  dayText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.accentPrimary,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  switch: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: "center",
  },
  switchOn: {
    backgroundColor: Colors.accentPrimary,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFF",
  },
  switchThumbOn: {
    transform: [{ translateX: 20 }],
  },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.textPrimary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 10,
  },
  fabText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
  fabPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  fabDisabled: {
    backgroundColor: Colors.border,
  },
});
