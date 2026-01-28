import { Colors } from "@/src/constants/colors";
import React from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "secondary";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "default",
  ...rest
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            variant === "secondary" ? Colors.surfaceSecondary : Colors.surface,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
});
