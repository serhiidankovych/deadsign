import { Colors } from "@/src/constants/colors";
import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from "react-native";

type TextVariant = "title" | "subtitle" | "body" | "caption" | "highlight";

type TextColor =
  | "primary"
  | "secondary"
  | "muted"
  | "placeholder"
  | "accent"
  | "accentSecondary"
  | "success"
  | "warning"
  | "error";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
}

const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontFamily: "Poppins_700Bold",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: "Poppins_500Medium",
    letterSpacing: 0.4,
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Roboto_400Regular",
    letterSpacing: 0.1,
  },

  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Roboto_400Regular",
    letterSpacing: 0.3,
  },

  highlight: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Poppins_500Medium",
    letterSpacing: 0.6,
  },
};

const COLOR_MAP: Record<TextColor, string> = {
  primary: Colors.textPrimary,
  secondary: Colors.textSecondary,
  muted: Colors.textMuted,
  placeholder: Colors.placeholder,
  accent: Colors.accentPrimary,
  accentSecondary: Colors.accentSecondary,
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
};

export const Text: React.FC<TextProps> = ({
  variant = "body",
  color = "primary",
  style,
  ...props
}) => {
  return (
    <RNText
      {...props}
      style={[VARIANT_STYLES[variant], { color: COLOR_MAP[color] }, style]}
    />
  );
};
