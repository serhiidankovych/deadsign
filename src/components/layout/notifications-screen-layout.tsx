import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  scrollEnabled?: boolean;
}

export function NotificationsScreenLayout({
  title,
  subtitle,
  children,
  headerRight,
  contentContainerStyle,
  scrollEnabled = true,
}: ScreenLayoutProps) {
  const Container = scrollEnabled ? ScrollView : View;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="title" style={styles.title}>
            {title}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {headerRight && <View>{headerRight}</View>}
      </View>

      <Container
        style={{ flex: 1 }}
        contentContainerStyle={[
          scrollEnabled && styles.scrollPadding,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollPadding: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: { flex: 1 },
  title: {
    color: Colors.textPrimary,

    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 20,

    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
