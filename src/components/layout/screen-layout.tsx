import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";

interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  contentContainerStyle?: ViewStyle;
}

export function ScreenLayout({
  title,
  subtitle,
  children,
  headerRight,
  contentContainerStyle,
}: ScreenLayoutProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="title">{title}</Text>

            {subtitle && (
              <Text
                variant="subtitle"
                color="secondary"
                style={styles.subtitleSpacing}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {headerRight && <View>{headerRight}</View>}
        </View>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  subtitleSpacing: {
    marginTop: 2,
  },
});
