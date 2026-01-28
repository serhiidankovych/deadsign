import Ionicons from "@expo/vector-icons/Ionicons";
import { RelativePathString, router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { CountrySelectModal } from "@/src/components/country-select-modal";
import { DateInputCard } from "@/src/components/date-input-card";
import { OnboardingLayout } from "@/src/components/layout/onboarding-layout";
import { ModeToggle } from "@/src/components/mode-toggle";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useOnboardingStore } from "@/src/features/onboarding/store/onboarding-store";

import {
  calculateYearsBetween,
  getLifeDateBounds,
  getYearLabel,
  isValidManualDeathDate,
} from "@/src/utils/user-stats";

export default function LifeExpectancyScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const dateOfBirth = onboardingData.dateOfBirth
    ? new Date(onboardingData.dateOfBirth)
    : new Date();

  const [mode, setMode] = useState<"country" | "manual">("country");
  const [country, setCountry] = useState("");
  const [countryLifeExpectancy, setCountryLifeExpectancy] = useState(0);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const { minDate, maxDate, defaultDeathDate } = getLifeDateBounds(dateOfBirth);
  const [manualDeathDate, setManualDeathDate] =
    useState<Date>(defaultDeathDate);

  const isManualMode = mode === "manual";

  const manualYears = calculateYearsBetween(dateOfBirth, manualDeathDate);
  const currentYears = isManualMode ? manualYears : countryLifeExpectancy;

  const isManualValid = isValidManualDeathDate(dateOfBirth, manualDeathDate);
  const canContinue = isManualMode
    ? isManualValid
    : country && countryLifeExpectancy > 0;

  const handleCountrySelect = (name: string, expectancy: number) => {
    setCountry(name);
    setCountryLifeExpectancy(expectancy);
  };

  const handleContinue = () => {
    if (!canContinue) return;

    updateOnboardingData({
      country: isManualMode ? "Custom" : country,
      lifeExpectancy: currentYears,
    });

    router.push("/onboarding/result" as RelativePathString);
  };

  const modeOptions = [
    {
      label: "By Country",
      value: "country",
      icon: (
        <Ionicons name="globe-outline" size={20} color={Colors.accentPrimary} />
      ),
    },
    {
      label: "Custom Date",
      value: "manual",
      icon: (
        <Ionicons
          name="pencil-outline"
          size={20}
          color={Colors.accentPrimary}
        />
      ),
    },
  ];

  return (
    <OnboardingLayout
      backgroundImage={require("../../assets/images/backgroud-intro.png")}
      title="Life Expectancy"
      subtitle="Set the horizon for your life table"
      onNext={handleContinue}
      nextDisabled={!canContinue}
      currentStep={3}
      totalSteps={6}
      disableScroll={true}
    >
      <View style={styles.container}>
        <ModeToggle
          options={modeOptions}
          selectedValue={mode}
          onValueChange={(value) => setMode(value as "country" | "manual")}
          style={styles.modeToggle}
        />

        {mode === "country" ? (
          <View style={styles.countryModeContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="body" style={styles.sectionLabel}>
                Choose your country
              </Text>
            </View>

            <Pressable
              style={styles.countrySelector}
              onPress={() => setShowCountryModal(true)}
            >
              <View style={styles.countrySelectorContent}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.countrySelectorText,
                    !country && styles.countrySelectorPlaceholder,
                  ]}
                >
                  {country || "Select a country"}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textSecondary}
              />
            </Pressable>

            {countryLifeExpectancy > 0 && (
              <View style={styles.expectancyBadge}>
                <Text style={styles.expectancyText}>
                  Expected lifespan: {countryLifeExpectancy}{" "}
                  {getYearLabel(countryLifeExpectancy)}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            <DateInputCard
              label="Choose your expected death date"
              date={manualDeathDate}
              onDateChange={setManualDeathDate}
              minimumDate={minDate}
              maximumDate={maxDate}
              infoText={
                isManualValid
                  ? `Expected lifespan: ${manualYears} ${getYearLabel(manualYears)}`
                  : "Please select a valid date"
              }
            />
          </View>
        )}
      </View>

      <CountrySelectModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        selectedCountry={country}
        onCountrySelect={handleCountrySelect}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeToggle: {
    marginBottom: 16,
  },
  countryModeContainer: {
    gap: 12,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countrySelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  countrySelectorText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  countrySelectorPlaceholder: {
    color: Colors.placeholder,
  },
  expectancyBadge: {
    marginTop: 4,
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
