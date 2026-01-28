import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";

interface DateInputCardProps {
  label: string;
  date: Date;
  onDateChange: (date: Date) => void;
  infoText?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

function DateInputCardComponent({
  label,
  date,
  onDateChange,
  infoText,
  minimumDate,
  maximumDate,
}: DateInputCardProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const lastPropTimestamp = useRef(date.getTime());
  const [displayedDate, setDisplayedDate] = useState(date);

  const isEditing = useRef(false);

  useEffect(() => {
    const newTimestamp = date.getTime();
    if (newTimestamp !== lastPropTimestamp.current && !isEditing.current) {
      lastPropTimestamp.current = newTimestamp;
      setDisplayedDate(new Date(newTimestamp));
    }
  }, [date]);

  const handlePress = () => {
    isEditing.current = true;
    setShowDatePicker(true);
  };

  const handleAndroidChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowDatePicker(false);
    isEditing.current = false;

    if (event.type === "set" && selectedDate) {
      lastPropTimestamp.current = selectedDate.getTime();
      setDisplayedDate(selectedDate);
      onDateChange(selectedDate);
    } else {
      setDisplayedDate(new Date(date.getTime()));
    }
  };

  const handleIOSChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setDisplayedDate(selectedDate);
    }
  };

  const confirmIOSDate = () => {
    isEditing.current = false;
    const newTimestamp = displayedDate.getTime();
    lastPropTimestamp.current = newTimestamp;
    onDateChange(displayedDate);
    setShowDatePicker(false);
  };

  const cancelIOSDate = () => {
    isEditing.current = false;
    setDisplayedDate(new Date(date.getTime()));
    setShowDatePicker(false);
  };

  return (
    <View>
      <View style={styles.rowBetween}>
        <Text variant="body" style={styles.sectionLabel}>
          {label}
        </Text>
      </View>

      <Pressable style={styles.dateInputButton} onPress={handlePress}>
        <Text style={styles.dateText}>
          {displayedDate.toLocaleDateString()}
        </Text>
        <Ionicons name="calendar" size={20} color={Colors.textMuted} />
      </Pressable>

      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={displayedDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleAndroidChange}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={cancelIOSDate}
        >
          <Pressable style={styles.modalBackdrop} onPress={cancelIOSDate}>
            <Pressable
              style={styles.iosPickerContainer}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.iosHeader}>
                <TouchableOpacity
                  onPress={cancelIOSDate}
                  style={styles.headerButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.iosHeaderTitle}>{label}</Text>
                <TouchableOpacity
                  onPress={confirmIOSDate}
                  style={styles.headerButton}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={displayedDate}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={handleIOSChange}
                textColor={Colors.textPrimary}
                themeVariant="light"
                style={styles.iosPicker}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {infoText && <Text style={styles.infoText}>{infoText}</Text>}
    </View>
  );
}

export const DateInputCard = React.memo(
  DateInputCardComponent,
  (prev, next) => {
    return (
      prev.date.getTime() === next.date.getTime() &&
      prev.label === next.label &&
      prev.infoText === next.infoText &&
      prev.minimumDate?.getTime() === next.minimumDate?.getTime() &&
      prev.maximumDate?.getTime() === next.maximumDate?.getTime()
    );
  },
);

const styles = StyleSheet.create({
  card: {},
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  infoText: {
    color: Colors.accentPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  dateInputButton: {
    backgroundColor: Colors.inputBackground,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  iosPickerContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  iosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iosHeaderTitle: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  headerButton: {
    padding: 8,
  },
  doneButtonText: {
    color: Colors.accentPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  iosPicker: {
    height: 200,
    width: "100%",
  },
});
