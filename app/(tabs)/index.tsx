import { ScreenLayout } from "@/src/components/layout/screen-layout";
import { ProgressBar } from "@/src/components/ui/progress-bar";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { LifeTable } from "@/src/features/life-table/components/life-table";
import { useLoadingStore } from "@/src/store/loading-store";
import { useUserStore } from "@/src/store/user-store";
import { calculateLifePercentage } from "@/src/utils/user-stats";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const GREETINGS = {
  morning: [
    "Good morning",
    "Rise and shine",
    "Top of the morning",
    "Morning, champ",
    "Hello sunshine",
  ],
  afternoon: [
    "Good afternoon",
    "Hope you're having a great day",
    "Hey there",
    "Afternoon vibes",
    "Hello",
  ],
  evening: [
    "Good evening",
    "Evening",
    "Relax, it's evening",
    "Hope you had a great day",
    "Evening vibes",
  ],
  night: [
    "Good night",
    "Time to rest",
    "Sleep tight",
    "Nighty night",
    "Sweet dreams",
  ],
  fallback: ["Hi there", "Whassup", "Hello!", "Hey!", "Greetings!"],
};

function randomFromArray(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  let greetingPool: string[];

  if (hour >= 5 && hour < 12) greetingPool = GREETINGS.morning;
  else if (hour >= 12 && hour < 17) greetingPool = GREETINGS.afternoon;
  else if (hour >= 17 && hour < 21) greetingPool = GREETINGS.evening;
  else greetingPool = GREETINGS.night;

  const greeting = randomFromArray(greetingPool);
  if (name) return `${greeting}, ${name}!`;

  return randomFromArray(GREETINGS.fallback);
}

export default function HomeScreen() {
  const { user } = useUserStore();
  const { setGlobalLoading } = useLoadingStore();

  const hasInitialized = useRef(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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
    [setGlobalLoading],
  );

  if (!user) return null;

  const percentageLived = calculateLifePercentage(
    user.weeksLived,
    user.totalWeeks,
  ).toFixed(0);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScreenLayout
        title={getGreeting(user.name)}
        subtitle="Your life in weeks"
      >
        <ProgressBar percentageCompleted={percentageLived} />

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
      </ScreenLayout>

      <Modal visible={isFullScreen} animationType="fade" statusBarTranslucent>
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullScreen(false)}
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
    </>
  );
}

const styles = StyleSheet.create({
  lifeTableSection: { flex: 1 },
  tableWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 350,
    position: "relative",
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
    elevation: 2,
  },
  skeletonContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 350,
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    opacity: 0.3,
  },
  loadingText: { color: Colors.textSecondary, fontWeight: "500" },
  fullScreenContainer: { flex: 1, backgroundColor: Colors.background },
  closeButton: { position: "absolute", top: 50, right: 20, zIndex: 1000 },
});
