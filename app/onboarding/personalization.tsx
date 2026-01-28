import { OnboardingLayout } from "@/src/components/layout/onboarding-layout";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useOnboardingStore } from "@/src/features/onboarding/store/onboarding-store";
import { Ionicons } from "@expo/vector-icons";
import { RelativePathString, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function PersonalizationScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [name, setName] = useState(onboardingData.name || "");

  const handleContinue = () => {
    if (name.trim()) {
      updateOnboardingData({ name: name.trim() });
      router.push("/onboarding/final" as RelativePathString);
    }
  };

  const handleSkip = () => {
    updateOnboardingData({ name: "" });
    router.push("/onboarding/final" as RelativePathString);
  };

  return (
    <OnboardingLayout
      backgroundImage={require("../../assets/images/backgroud-bottom.png")}
      title="What's Your Name?"
      subtitle="We'll personalize your experience"
      onNext={handleContinue}
      nextDisabled={!name.trim()}
      showSkip={true}
      onSkip={handleSkip}
      currentStep={5}
      totalSteps={6}
    >
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your Name</Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={20}
            color={Colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={name}
            maxLength={25}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            autoFocus
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  preview: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.accentPrimary,
    textAlign: "center",
  },
  benefitsBox: {
    marginTop: 32,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  privacyNote: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
