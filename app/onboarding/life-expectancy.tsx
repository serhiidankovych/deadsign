import { CountrySelector } from "@/src/components/country-selector";
import { DateInputCard } from "@/src/components/date-input-card";
import { OnboardingLayout } from "@/src/components/layout/onboarding-layout";
import { ModeToggle } from "@/src/components/mode-toggle";
import { Colors } from "@/src/constants/colors";
import { RelativePathString, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "../../src/components/ui/card";
import { Text } from "../../src/components/ui/text";
import { useOnboardingStore } from "../../src/features/onboarding/store/onboarding-store";

export default function LifeExpectancyScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const dateOfBirth = onboardingData.dateOfBirth || new Date();

  const [country, setCountry] = useState("");
  const [countryLifeExpectancy, setCountryLifeExpectancy] = useState(0);
  const [mode, setMode] = useState<"country" | "manual">("country");

  const [manualDeathDate, setManualDeathDate] = useState(() => {
    const defaultDate = new Date(dateOfBirth);
    defaultDate.setFullYear(defaultDate.getFullYear() + 80);
    return defaultDate;
  });

  const isManualMode = mode === "manual";

  const handleContinue = () => {
    const lifeExpectancy = isManualMode
      ? Math.floor(
          (manualDeathDate.getTime() - dateOfBirth.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25),
        )
      : countryLifeExpectancy;

    updateOnboardingData({
      country: isManualMode ? "Custom" : country,
      lifeExpectancy,
    });

    router.push("/onboarding/result" as RelativePathString);
  };

  const calculateExpectedYears = () =>
    Math.floor(
      (manualDeathDate.getTime() - dateOfBirth.getTime()) /
        (1000 * 60 * 60 * 24 * 365.25),
    );

  const handleCountrySelect = (name: string, expectancy: number) => {
    setCountry(name);
    setCountryLifeExpectancy(expectancy);
  };

  const canContinue = isManualMode || (country && countryLifeExpectancy > 0);

  const modeOptions = [
    { label: "By Country", value: "country", icon: "🌎" },
    { label: "Custom Date", value: "manual", icon: "✏️" },
  ];

  return (
    <OnboardingLayout
      backgroundImage={require("../../assets/images/backgroud-intro.png")}
      title="Life Expectancy"
      subtitle="Choose how to calculate your life expectancy"
      onNext={handleContinue}
      nextDisabled={!canContinue}
      currentStep={3}
      totalSteps={6}
      disableScroll={true}
    >
      <ModeToggle
        options={modeOptions}
        selectedValue={mode}
        onValueChange={(value) => setMode(value as "country" | "manual")}
        style={styles.modeToggle}
      />

      {mode === "country" && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text variant="body" style={styles.sectionLabel}>
              Choose Your Country
            </Text>
            <Text style={styles.helperText}>
              We&apos;ll use the average life expectancy
            </Text>
          </View>

          <CountrySelector
            selectedCountry={country}
            onCountrySelect={handleCountrySelect}
            maxHeight={200}
          />

          {country && countryLifeExpectancy > 0 && (
            <View style={styles.expectancyBadge}>
              <Text style={styles.expectancyText}>
                Average: {countryLifeExpectancy} years
              </Text>
            </View>
          )}
        </Card>
      )}

      {mode === "manual" && (
        <DateInputCard
          label="Choose Your Expected Death Date"
          date={manualDeathDate}
          onDateChange={setManualDeathDate}
          minimumDate={
            new Date(dateOfBirth.getTime() + 365 * 24 * 60 * 60 * 1000)
          }
          infoText={`Expected lifespan: ${calculateExpectedYears()} years`}
        />
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  modeToggle: {
    marginBottom: 24,
  },
  card: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  helperText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  expectancyBadge: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    alignItems: "center",
  },
  expectancyText: {
    color: Colors.accentPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
});
