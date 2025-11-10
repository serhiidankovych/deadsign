import { Colors } from "@/src/constants/colors";
import { StyleSheet } from "react-native";
import { HEADER_HEIGHT, YEAR_LABEL_WIDTH } from "../constants";

export const styles = StyleSheet.create({
  tableWrapper: {
    backgroundColor: Colors.background,
  },
  stickyHeader: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    height: HEADER_HEIGHT,
    alignItems: "center",
  },
  headerLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    textAlign: "center",
  },
  tableContent: {
    flexDirection: "row",
  },
  yearColumn: {
    width: YEAR_LABEL_WIDTH,
    backgroundColor: Colors.background,
  },
  yearRow: {
    justifyContent: "center",
    paddingRight: 5,
  },
  canvasWrapper: {
    flex: 1,
  },
  ageLabel: {
    color: Colors.textMuted,
    textAlign: "right",
    fontWeight: "500",
    fontSize: 10,
  },
  currentRowLabel: {
    color: Colors.accentPrimary,
    fontWeight: "bold",
  },
});
