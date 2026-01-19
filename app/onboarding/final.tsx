import { OnboardingLayout } from "@/src/components/layout/onboarding-layout";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useOnboardingStore } from "@/src/features/onboarding/store/onboarding-store";
import { useUserStore } from "@/src/store/user-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { quotes } from "../../src/data/quotes";

export default function FinalScreen() {
  const { onboardingData, clearOnboardingData } = useOnboardingStore();
  const { setUser } = useUserStore();
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFinish = async () => {
    try {
      await setUser({
        name: onboardingData.name!,
        dateOfBirth: onboardingData.dateOfBirth!,
        country: onboardingData.country!,
        lifeExpectancy: onboardingData.lifeExpectancy!,
      });
      await clearOnboardingData();
      if (router.canGoBack()) {
        router.dismissAll();
      }
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error finishing onboarding:", error);
    }
  };

  const userName = onboardingData.name?.trim() || "Friend";

  return (
    <OnboardingLayout
      backgroundImage={require("../../assets/images/backgroud-top-bottom.png")}
      onNext={handleFinish}
      nextLabel="Start Your Journey"
      currentStep={6}
      totalSteps={6}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <View style={styles.header}>
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>
              <Ionicons name="checkmark" size={24} color={Colors.background} />
            </Text>
          </View>

          <Text variant="title" style={styles.greeting}>
            Welcome, {userName}!
          </Text>

          <Text style={styles.subGreeting}>Your life calendar is ready</Text>
        </View>

        <View style={styles.quoteContainer}>
          <View style={styles.quoteIcon}>
            <Text style={styles.quoteSymbol}>
              <Ionicons name="book" size={24} color={Colors.accentPrimary} />
            </Text>
          </View>
          <Text variant="body" style={styles.quote}>
            {randomQuote.text}
          </Text>
          <Text variant="caption" style={styles.author}>
            — {randomQuote.author}
          </Text>
        </View>
      </Animated.View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkmark: {
    fontSize: 40,
    color: Colors.background,
    fontWeight: "bold",
  },
  greeting: {
    color: Colors.textPrimary,
    textAlign: "center",
    fontSize: 32,
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  quoteContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderLeftWidth: 4,
    borderLeftColor: Colors.accentPrimary,
  },
  quoteIcon: {
    marginBottom: 8,
  },
  quoteSymbol: {
    fontSize: 48,
    color: Colors.accentPrimary,
    opacity: 0.3,
    lineHeight: 48,
  },
  quote: {
    fontSize: 17,
    lineHeight: 26,
    fontStyle: "italic",
    textAlign: "left",
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  author: {
    color: Colors.textMuted,
    textAlign: "right",
    fontSize: 14,
  },
  featuresContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  finalNote: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentPrimary,
  },
  finalNoteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
