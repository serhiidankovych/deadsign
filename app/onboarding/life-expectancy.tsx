import { RelativePathString, router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CountrySelector } from "@/src/components/country-selector";
import { DateInputCard } from "@/src/components/date-input-card";
import { Colors } from "@/src/constants/colors";
import { Button } from "../../src/components/ui/button";
import { Card } from "../../src/components/ui/card";
import { Text } from "../../src/components/ui/text";
import { useOnboardingStore } from "../../src/features/onboarding/store/onboarding-store";

export default function LifeExpectancyScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const dateOfBirth = onboardingData.dateOfBirth || new Date();

  const [country, setCountry] = useState("");
  const [countryLifeExpectancy, setCountryLifeExpectancy] = useState(0);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualDeathDate, setManualDeathDate] = useState(() => {
    const defaultDate = new Date(dateOfBirth);
    defaultDate.setFullYear(defaultDate.getFullYear() + 80);
    return defaultDate;
  });

  const handleContinue = () => {
    const lifeExpectancy = isManualMode
      ? Math.floor(
          (manualDeathDate.getTime() - dateOfBirth.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
        )
      : countryLifeExpectancy;

    updateOnboardingData({
      country,
      lifeExpectancy,
    });
    router.push("/onboarding/result" as RelativePathString);
  };

  const handleCountrySelect = (countryName: string, lifeExpectancy: number) => {
    setCountry(countryName);
    setCountryLifeExpectancy(lifeExpectancy);
  };

  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    if (!isManualMode) {
      const defaultDeathDate = new Date(dateOfBirth);
      defaultDeathDate.setFullYear(defaultDeathDate.getFullYear() + 80);
      setManualDeathDate(defaultDeathDate);
    }
  };

  const calculateExpectedYears = () =>
    Math.floor(
      (manualDeathDate.getTime() - dateOfBirth.getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text variant="title" style={styles.title}>
              Life Expectancy Setup
            </Text>
            <Text style={styles.subtitle}>
              Choose how to calculate your life expectancy
            </Text>
          </View>

          <View style={styles.modeToggle}>
            <Pressable
              style={[
                styles.toggleButton,
                !isManualMode && styles.toggleButtonActive,
              ]}
              onPress={() => setIsManualMode(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isManualMode && styles.toggleTextActive,
                ]}
              >
                By Country
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                isManualMode && styles.toggleButtonActive,
              ]}
              onPress={toggleManualMode}
            >
              <Text
                style={[
                  styles.toggleText,
                  isManualMode && styles.toggleTextActive,
                ]}
              >
                Manual Date
              </Text>
            </Pressable>
          </View>

          {!isManualMode ? (
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="body" style={styles.sectionLabel}>
                  Choose Your Country
                </Text>
              </View>

              <CountrySelector
                selectedCountry={country}
                onCountrySelect={handleCountrySelect}
                maxHeight={300}
              />
            </Card>
          ) : (
            <DateInputCard
              label="Choose Your Death Date"
              date={manualDeathDate}
              onDateChange={setManualDeathDate}
              minimumDate={
                new Date(dateOfBirth.getTime() + 365 * 24 * 60 * 60 * 1000)
              }
              infoText={`Expected: ${calculateExpectedYears()} years`}
            />
          )}

          <View style={styles.spacer} />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            disabled={!country && !isManualMode}
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
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    color: Colors.textPrimary,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: "center",
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: Colors.accentPrimary,
  },
  toggleText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: Colors.background,
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
    borderTopColor: Colors.surfaceSecondary,
  },
  continueButton: {
    backgroundColor: Colors.accentPrimary,
    borderRadius: 12,
    paddingVertical: 16,
  },
});
