import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Text } from "../../src/components/ui/text";
import { Button } from "../../src/components/ui/button";

import { quotes } from "../../src/data/quotes";
import { useOnboardingStore } from "@/src/store/onboarding-store";
import { useUserStore } from "@/src/store/user-store";

export default function FinalScreen() {
  const { onboardingData, clearOnboardingData } = useOnboardingStore();
  const { setUser } = useUserStore();

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const handleFinish = () => {
    setUser({
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
    justifyContent: "space-between", // Pushes header to top, button to bottom
    padding: 20,
  },
  header: {
    // We remove `flex: 1` and `justifyContent: 'center'`
    // to align the content to the top.
    paddingTop: 40, // Add some spacing from the top edge
  },
  greeting: {
    color: "#FAFF00",
    textAlign: "center",
    marginBottom: 40,
  },
  quoteContainer: {
    backgroundColor: "rgba(27, 26, 26, 0.8)",
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 10,
  },
  quote: {
    color: "#FFF",
    fontSize: 18,
    lineHeight: 26,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
  },
  author: {
    color: "#999",
    textAlign: "center",
  },
  continueButton: {
    marginBottom: 20,
  },
});
