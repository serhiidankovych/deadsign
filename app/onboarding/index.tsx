import { OnboardingLayout } from "@/src/components/layout/onboarding-layout";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { RelativePathString, router } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function IntroScreen() {
  const fadeAnims = React.useRef(
    [0, 1, 2].map(() => new Animated.Value(0)),
  ).current;

  React.useEffect(() => {
    Animated.stagger(
      150,
      fadeAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, []);

  const benefits = [
    {
      text: "Visualize your life in weeks",
      icon: "calendar-outline" as const,
    },
    {
      text: "Custom motivational notifications",
      icon: "notifications-outline" as const,
    },
    {
      text: "Set it up once, benefit forever",
      icon: "infinite-outline" as const,
    },
  ];

  return (
    <OnboardingLayout
      backgroundImage={require("../../assets/images/backgroud-intro.png")}
      onNext={() =>
        router.push("/onboarding/date-of-birth" as RelativePathString)
      }
      nextLabel="Get Started"
      currentStep={1}
      totalSteps={6}
      scrollEnabled={true}
    >
      <View style={styles.header}>
        <LottieView
          source={require("../../assets/images/deadsign-clip.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text variant="title" style={styles.titleText}>
          Deadsign
        </Text>

        <Text variant="subtitle" color="secondary" style={styles.centerText}>
          The app helps you design the most important thing —{" "}
        </Text>
        <Text variant="highlight" color="accent" style={styles.centerText}>
          your life.
        </Text>
      </View>

      <View style={styles.benefitsContainer}>
        {benefits.map((item, index) => (
          <Animated.View key={index} style={{ opacity: fadeAnims[index] }}>
            <Card style={styles.benefitCard}>
              <View style={styles.benefitItem}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={Colors.accentPrimary}
                  />
                </View>
                <View style={styles.benefitTextContainer}>
                  <Text variant="body" style={styles.benefitTitle}>
                    {item.text}
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  lottie: {
    width: 180,
    height: 180,
    marginBottom: 8,
  },
  titleText: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 8,
  },
  centerText: {
    textAlign: "center",
    marginTop: 4,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitCard: {
    padding: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
