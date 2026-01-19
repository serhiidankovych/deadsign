import { Colors } from "@/src/constants/colors";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Text } from "./text";

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = "primary",
  style,
  disabled = false,
  loading = false,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "secondary" ? Colors.textPrimary : Colors.background
          }
        />
      ) : (
        <Text variant="body" style={[styles.text, styles[`${variant}Text`]]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  disabled: {
    opacity: 0.45,
  },

  primary: {
    backgroundColor: Colors.accentPrimary,
  },

  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  danger: {
    backgroundColor: Colors.error,
  },

  text: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
    letterSpacing: 0.3,
  },

  primaryText: {
    color: Colors.background,
  },

  secondaryText: {
    color: Colors.textPrimary,
  },

  dangerText: {
    color: Colors.background,
  },
});
