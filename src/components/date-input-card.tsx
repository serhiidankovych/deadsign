import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Card } from "@/src/components/ui/card";
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

export function DateInputCard({
  label,
  date,
  onDateChange,
  infoText,
  minimumDate,
  maximumDate,
}: DateInputCardProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <Card>
      <View style={styles.rowBetween}>
        <Text variant="body" style={styles.sectionLabel}>
          {label}
        </Text>
      </View>

      <Pressable
        style={styles.dateInputButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        <Ionicons name="calendar" size={20} color={Colors.textMuted} />
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              onDateChange(selectedDate);
            }
          }}
        />
      )}
      {infoText && <Text style={styles.infoText}>{infoText}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
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
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
});
