import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

interface ModeToggleOption {
  label: string;
  value: string;
  icon?: string;
}

interface ModeToggleProps {
  options: ModeToggleOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  options,
  selectedValue,
  onValueChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.button, isSelected && styles.buttonActive]}
            onPress={() => onValueChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[styles.buttonText, isSelected && styles.buttonTextActive]}
            >
              {option.icon && `${option.icon} `}
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: {
    backgroundColor: Colors.accentPrimary,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  buttonTextActive: {
    color: Colors.background,
    fontWeight: "700",
  },
});
