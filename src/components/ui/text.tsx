import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from "react-native";

interface TextProps extends RNTextProps {
  variant?: "title" | "subtitle" | "body" | "caption";
}

export const Text: React.FC<TextProps> = ({
  variant = "body",
  style,
  ...props
}) => {
  return <RNText style={[styles[variant], style]} {...props} />;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
  },
  body: {
    fontSize: 16,
    color: "#FFF",
  },
  caption: {
    fontSize: 14,
    color: "#999",
  },
});
