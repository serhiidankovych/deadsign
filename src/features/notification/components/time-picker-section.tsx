import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, View } from "react-native";
import { styles } from "./notification-settings.styles";

interface TimePickerSectionProps {
  time: Date;
  showPicker: boolean;
  onOpenPicker: () => void;
  onChange: (event: any, selectedDate?: Date) => void;
}

export function TimePickerSection({
  time,
  showPicker,
  onOpenPicker,
  onChange,
}: TimePickerSectionProps) {
  return (
    <View style={styles.timePickerContainer}>
      <Text variant="body" style={styles.timeLabel}>
        Reminder Time
      </Text>

      <Button
        variant="secondary"
        onPress={onOpenPicker}
        style={styles.timeButton}
      >
        {`${time.getHours().toString().padStart(2, "0")}:${time
          .getMinutes()
          .toString()
          .padStart(2, "0")}`}
      </Button>

      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
          textColor="#FAFF00"
        />
      )}
    </View>
  );
}
