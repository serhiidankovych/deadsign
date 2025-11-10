import { Colors } from "@/src/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    flex: 1,
    overflow: "hidden",
  },
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  captureContainer: {
    position: "absolute",
    top: 0,
    left: -10000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
});
