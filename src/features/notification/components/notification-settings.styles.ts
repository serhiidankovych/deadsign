import { StyleSheet } from "react-native";

import { Colors } from "@/src/constants/colors";

export const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    color: Colors.textMuted,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    color: Colors.textSecondary,
  },
  timePickerContainer: {
    marginTop: 8,
  },
  timeLabel: {
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  timeButton: {
    alignSelf: "flex-start",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
