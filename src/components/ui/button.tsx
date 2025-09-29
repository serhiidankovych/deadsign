import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Text } from "./text";

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = "primary",
  style,
  disabled = false,
}) => {
  return (
    <Pressable
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#FAFF00",
  },
  secondary: {
    backgroundColor: "#1B1A1A",
    borderWidth: 1,
    borderColor: "#333",
  },
  danger: {
    backgroundColor: "#FF3B30",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#0E0D0D",
  },
  secondaryText: {
    color: "#FFF",
  },
  dangerText: {
    color: "#FFF",
  },
});
