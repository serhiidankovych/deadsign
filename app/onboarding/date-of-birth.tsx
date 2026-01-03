import { RelativePathString, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateInputCard } from "@/src/components/date-input-card";
import { Colors } from "@/src/constants/colors";
import { calculateAge } from "@/src/utils/user-stats";
import { Button } from "../../src/components/ui/button";
import { Text } from "../../src/components/ui/text";
import { useOnboardingStore } from "../../src/features/onboarding/store/onboarding-store";

export default function DateOfBirthScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [dateOfBirth, setDateOfBirth] = useState(
    onboardingData.dateOfBirth || new Date()
  );

  const handleContinue = () => {
    updateOnboardingData({ dateOfBirth });
    router.push("/onboarding/life-expectancy" as RelativePathString);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text variant="title" style={styles.title}>
              When Were You Born?
            </Text>
            <Text style={styles.subtitle}>
              This helps us calculate your life calendar
            </Text>
          </View>

          <DateInputCard
            label="Date of Birth"
            date={dateOfBirth}
            onDateChange={setDateOfBirth}
            maximumDate={new Date()}
            infoText={`Age: ${calculateAge(dateOfBirth)}`}
          />

          <View style={styles.spacer} />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            disabled={!dateOfBirth}
            style={styles.continueButton}
          >
            Continue
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    color: Colors.textPrimary,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: "center",
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  spacer: {
    height: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueButton: {
    backgroundColor: Colors.accentPrimary,
    borderRadius: 12,
    paddingVertical: 16,
  },
});
