import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  captureContainer: {
    position: "absolute",
    top: -10000,
    left: -10000,
  },
});
