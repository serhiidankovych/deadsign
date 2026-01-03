import { NotificationPrompt } from "@/src/components/notification-promt";
import { ProgressBar } from "@/src/components/ui/progress-bar";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { LifeTable } from "@/src/features/life-table/components/life-table";

import { useLoadingStore } from "@/src/store/loading-store";
import { useUserStore } from "@/src/store/user-store";
import { calculateLifePercentage } from "@/src/utils/user-stats";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROMPT_STORAGE_KEY = "@notification_prompt_dismissed";
const PROMPT_COOLDOWN_DAYS = 7;

export default function HomeScreen() {
  const { user } = useUserStore();
  const { setGlobalLoading } = useLoadingStore();
  const router = useRouter();
  const hasInitialized = useRef(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    const checkPromptVisibility = async () => {
      try {
        const dismissedData = await AsyncStorage.getItem(PROMPT_STORAGE_KEY);

        if (!dismissedData) {
          return;
        }

        const { timestamp } = JSON.parse(dismissedData);
        const daysSinceDismissed =
          (Date.now() - timestamp) / (1000 * 60 * 60 * 24);

        if (daysSinceDismissed >= PROMPT_COOLDOWN_DAYS) {
          setShowNotificationPrompt(false);
        }
      } catch (error) {
        console.error("Error checking prompt visibility:", error);
      }
    };

    if (isImageLoaded) {
      checkPromptVisibility();

      setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 800);
    }
  }, [isImageLoaded]);

  useEffect(() => {
    if (!hasInitialized.current) {
      setGlobalLoading(true);
      hasInitialized.current = true;
    }
  }, []);

  const handleLoadingChange = useCallback(
    (isLoading: boolean) => {
      if (!isLoading) {
        setGlobalLoading(false);
        setIsImageLoaded(true);
      }
    },
    [setGlobalLoading]
  );

  const handleSetReminders = useCallback(() => {
    setShowNotificationPrompt(false);

    router.push("/notifications");
  }, [router]);

  const handleDismissPrompt = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        PROMPT_STORAGE_KEY,
        JSON.stringify({ timestamp: Date.now() })
      );
      setShowNotificationPrompt(false);
    } catch (error) {
      console.error("Error saving prompt dismissal:", error);
    }
  }, []);

  if (!user) return null;

  const percentageLived = calculateLifePercentage(
    user.weeksLived,
    user.totalWeeks
  ).toFixed(0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <LinearGradient
            colors={[Colors.surfaceSecondary, Colors.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.headerGradient}
          >
            <View>
              <Text variant="title" style={styles.greeting}>
                Hello, {user.name}
              </Text>
              <View style={styles.statsRow}>
                <Text variant="subtitle" style={styles.subtitle}>
                  Your life in weeks
                </Text>
              </View>
              <ProgressBar percentageCompleted={percentageLived} />
            </View>
          </LinearGradient>

          <View style={styles.lifeTableSection}>
            {!isImageLoaded && (
              <View style={styles.skeletonContainer}>
                <View style={styles.skeleton} />
                <Text variant="body" style={styles.loadingText}>
                  Generating your life...
                </Text>
              </View>
            )}

            <Pressable
              style={styles.tableWrapper}
              onPress={() => isImageLoaded && setIsFullScreen(true)}
              disabled={!isImageLoaded}
            >
              <LifeTable
                user={user}
                onLoadingChange={handleLoadingChange}
                isFullScreen={false}
              />

              {isImageLoaded && (
                <View style={styles.expandOverlay}>
                  <Ionicons
                    name="resize-outline"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
              )}
            </Pressable>
          </View>

          {showNotificationPrompt && isImageLoaded && (
            <NotificationPrompt
              onSetReminders={handleSetReminders}
              onDismiss={handleDismissPrompt}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={isFullScreen}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View style={styles.fullScreenContainer}>
          <StatusBar hidden />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullScreen(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <LifeTable
            user={user}
            onLoadingChange={handleLoadingChange}
            isFullScreen={true}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 20,
  },
  greeting: {
    color: Colors.textPrimary,
    marginBottom: 8,
    fontSize: 26,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  lifeTableSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  tableWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 300,
    position: "relative",
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  expandOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: Colors.surface,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  skeletonContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  skeleton: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    opacity: 0.3,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
  },
});
