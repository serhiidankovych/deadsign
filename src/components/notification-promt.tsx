import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

interface NotificationPromptProps {
  onSetReminders: () => void;
  onDismiss: () => void;
}

export function NotificationPrompt({
  onSetReminders,
  onDismiss,
}: NotificationPromptProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.surface, Colors.surfaceSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.iconBackground}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={Colors.accentPrimary}
            />
          </View>
          <View style={styles.headerContent}>
            <Text variant="subtitle" style={styles.title}>
              Stay on track with life stats?
            </Text>
            <Text variant="body" style={styles.description}>
              Set up reminders to track your progress
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSetReminders}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Set reminders</Text>
          </TouchableOpacity>

          <Pressable
            style={styles.secondaryButton}
            onPress={onDismiss}
            android_ripple={{ color: Colors.borderLight }}
          >
            <Text style={styles.secondaryButtonText}>Not now</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.selectedBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.selectedBorder,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.accentPrimary,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.background,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});
