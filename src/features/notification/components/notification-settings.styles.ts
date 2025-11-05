import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    color: "#FAFF00",
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
    color: "#FFF",
    marginBottom: 4,
  },
  description: {
    color: "#999",
  },
  timePickerContainer: {
    marginTop: 8,
  },
  timeLabel: {
    color: "#999",
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
