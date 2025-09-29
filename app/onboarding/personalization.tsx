import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RelativePathString, router } from "expo-router";
import { useOnboardingStore } from "@/src/store/onboarding-store";
import { VideoView, useVideoPlayer } from "expo-video";

import { Text } from "@/src/components/ui/text";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";

export default function PersonalizationScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [name, setName] = useState(onboardingData.name || "");
  const player = useVideoPlayer(require("./"), (player) => {
    player.loop = true;
    player.play();
  });

  const handleContinue = () => {
    player.pause();
    updateOnboardingData({ name });
    router.push("/onboarding/final" as RelativePathString);
  };

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <SafeAreaView style={styles.safeAreaContainer}>
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0.3)",
            "rgba(0, 0, 0, 0.5)",
            "rgba(0, 0, 0, 0.7)",
          ]}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text variant="title" style={styles.title}>
                  What&apos;s your name?
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.footer}>
            <LinearGradient
              colors={[
                "transparent",
                "rgba(0, 0, 0, 0.4)",
                "rgba(0, 0, 0, 0.8)",
                "rgba(0, 0, 0, 0.95)",
              ]}
              style={styles.gradient}
            />
            <View style={styles.buttonContainer}>
              <Card style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="done"
                />
              </Card>

              <View style={styles.buttonWrapper}>
                <LinearGradient
                  colors={["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.1)"]}
                  style={styles.buttonBackgroundGradient}
                />
                <Button onPress={handleContinue} disabled={!name.trim()}>
                  Continue
                </Button>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 180,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
  },
  headerContent: {
    position: "relative",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  // Enhanced styles for title and subtitle with better contrast
  title: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 1,
  },
  subtitle: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 26,
    paddingHorizontal: 20,
    opacity: 0.95,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    zIndex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  buttonContainer: {
    paddingBottom: 30,
    paddingHorizontal: 20, // 🔑 keeps input nicely inset
  },

  inputCard: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    width: "100%", // 🔑 make Card full width
  },

  input: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 16,
    borderRadius: 12,
    color: "#FFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    width: "100%", // 🔑 ensure TextInput fills Card
  },

  buttonWrapper: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonBackgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
});
