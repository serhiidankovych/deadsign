import { Colors } from "@/src/constants/colors";
import { router } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui/button";
import { Text } from "../../src/components/ui/text";

import { useOnboardingStore } from "@/src/features/onboarding/store/onboarding-store";
import { useUserStore } from "@/src/store/user-store";
import { quotes } from "../../src/data/quotes";

export default function FinalScreen() {
  const { onboardingData, clearOnboardingData } = useOnboardingStore();
  const { setUser } = useUserStore();

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const handleFinish = async () => {
    await setUser({
      name: onboardingData.name!,
      dateOfBirth: onboardingData.dateOfBirth!,
      country: onboardingData.country!,
      lifeExpectancy: onboardingData.lifeExpectancy!,
    });

    clearOnboardingData();
    router.replace("/(tabs)");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/intro-background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="title" style={styles.greeting}>
              Welcome, {onboardingData.name}!
            </Text>

            <View style={styles.quoteContainer}>
              <Text variant="body" style={styles.quote}>
                {randomQuote.text}
              </Text>
              <Text variant="caption" style={styles.author}>
                — {randomQuote.author}
              </Text>
            </View>
          </View>

          <Button onPress={handleFinish} style={styles.continueButton}>
            Continue to App
          </Button>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  header: {
    paddingTop: 40,
  },
  greeting: {
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 40,
  },
  quoteContainer: {
    backgroundColor: Colors.surfaceSecondary,
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 10,
  },
  quote: {
    fontSize: 18,
    lineHeight: 26,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
  },
  author: {
    color: Colors.textMuted,
    textAlign: "center",
  },
  continueButton: {
    marginBottom: 20,
  },
});
