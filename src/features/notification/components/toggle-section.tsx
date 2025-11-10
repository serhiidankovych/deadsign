import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import React from "react";
import { Switch, View } from "react-native";
import { styles } from "./notification-settings.styles";

interface ToggleSectionProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

export function ToggleSection({
  label,
  description,
  value,
  onToggle,
}: ToggleSectionProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text variant="body" style={styles.label}>
          {label}
        </Text>
        <Text variant="caption" style={styles.description}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: Colors.border,
          true: Colors.accentPrimary,
        }}
        thumbColor={value ? Colors.accentPrimary : Colors.accentPrimary}
      />
    </View>
  );
}
