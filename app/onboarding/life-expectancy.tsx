import { Colors } from "@/src/constants/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RelativePathString, router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui/button";
import { Card } from "../../src/components/ui/card";
import { Text } from "../../src/components/ui/text";
import { useOnboardingStore } from "../../src/features/onboarding/store/onboarding-store";
import { calculateLifeExpectancy } from "../../src/utils/life-expactancy";

export default function LifeExpectancyScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const dateOfBirth = onboardingData.dateOfBirth || new Date();

  const [country, setCountry] = useState(onboardingData.country || "Ukraine");
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualDeathDate, setManualDeathDate] = useState(() => {
    const defaultDate = new Date(dateOfBirth);
    defaultDate.setFullYear(defaultDate.getFullYear() + 80);
    return defaultDate;
  });
  const [showManualDatePicker, setShowManualDatePicker] = useState(false);

  const countries = [
    { name: "Ukraine", flag: "🇺🇦", lifeExpectancy: 72 },
    { name: "United States", flag: "🇺🇸", lifeExpectancy: 79 },
    { name: "Germany", flag: "🇩🇪", lifeExpectancy: 81 },
    { name: "Japan", flag: "🇯🇵", lifeExpectancy: 85 },
    { name: "United Kingdom", flag: "🇬🇧", lifeExpectancy: 81 },
  ];

  const handleContinue = () => {
    const lifeExpectancy = isManualMode
      ? Math.floor(
          (manualDeathDate.getTime() - dateOfBirth.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
        )
      : calculateLifeExpectancy(dateOfBirth, country);

    updateOnboardingData({
      country,
      lifeExpectancy,
    });
    router.push("/onboarding/result" as RelativePathString);
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

              <View style={styles.countryContainer}>
                <ScrollView
                  style={styles.countryScrollView}
                  contentContainerStyle={styles.countryScrollContent}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {countries.map((item) => (
                    <Pressable
                      key={item.name}
                      style={[
                        styles.countryItem,
                        country === item.name && styles.countryItemSelected,
                      ]}
                      onPress={() => setCountry(item.name)}
                    >
                      <Text style={styles.flag}>{item.flag}</Text>
                      <View style={styles.countryInfo}>
                        <Text
                          style={[
                            styles.countryName,
                            country === item.name && styles.countryNameSelected,
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.lifeExpectancyText}>
                          Life expectancy: {item.lifeExpectancy} years
                        </Text>
                      </View>
                      {country === item.name && (
                        <View style={styles.selectedIndicator}>
                          <Text style={styles.checkmark}>✓</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </Card>
          ) : (
            <Card style={styles.section}>
              <Text variant="body" style={styles.sectionLabel}>
                Choose Your Death Date
              </Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowManualDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {manualDeathDate.toLocaleDateString()}
                </Text>
                <Text style={styles.dateHint}>Tap to change</Text>
              </Pressable>

              <View style={styles.selectionSummary}>
                <Text style={styles.summaryText}>
                  Expected lifespan: {calculateExpectedYears()} years
                </Text>
              </View>
            </Card>
          )}

          {showManualDatePicker && (
            <DateTimePicker
              value={manualDeathDate}
              mode="date"
              display="default"
              minimumDate={
                new Date(dateOfBirth.getTime() + 365 * 24 * 60 * 60 * 1000)
              }
              onChange={(event, selectedDate) => {
                setShowManualDatePicker(false);
                if (selectedDate) {
                  setManualDeathDate(selectedDate);
                }
              }}
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
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
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
  dateButton: {
    backgroundColor: Colors.inputBackground,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surfaceSecondary,
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateHint: {
    color: Colors.textSecondary,
    fontSize: 14,
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
  countryContainer: {
    position: "relative",
  },
  countryScrollView: {
    maxHeight: 280,
    paddingRight: 20,
  },
  countryScrollContent: {
    paddingBottom: 10,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  countryItemSelected: {
    borderColor: Colors.accentPrimary,
    backgroundColor: Colors.surface,
  },
  flag: {
    fontSize: 28,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  countryNameSelected: {
    color: Colors.accentPrimary,
  },
  lifeExpectancyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: "bold",
  },
  selectionSummary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    alignItems: "center",
  },
  summaryText: {
    color: Colors.accentPrimary,
    fontSize: 16,
    fontWeight: "600",
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
