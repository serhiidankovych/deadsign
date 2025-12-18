import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 20,
  },
  captureContainer: {},
  zoomControls: {
    position: "absolute",
    bottom: 40,
    right: 20,
    flexDirection: "column",
    gap: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 28,
    padding: 8,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
