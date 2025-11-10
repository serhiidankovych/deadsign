import { Colors } from "@/src/constants/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RelativePathString, router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui/button";
import { Card } from "../../src/components/ui/card";
import { Text } from "../../src/components/ui/text";
import { useOnboardingStore } from "../../src/features/onboarding/store/onboarding-store";

export default function DateOfBirthScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [dateOfBirth, setDateOfBirth] = useState(
    onboardingData.dateOfBirth || new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleContinue = () => {
    updateOnboardingData({
      dateOfBirth,
    });
    router.push("/onboarding/life-expectancy" as RelativePathString);
  };

  const calculateAge = () => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
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

          <Card style={styles.section}>
            <Text variant="body" style={styles.sectionLabel}>
              Date of Birth
            </Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {dateOfBirth.toLocaleDateString()}
              </Text>
              <Text style={styles.dateHint}>Tap to change</Text>
            </Pressable>

            {dateOfBirth && (
              <View style={styles.ageDisplay}>
                <Text style={styles.ageText}>
                  You are {calculateAge()} years old
                </Text>
              </View>
            )}
          </Card>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                }
              }}
            />
          )}

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
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
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
    borderColor: Colors.borderLight,
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateHint: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  ageDisplay: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    alignItems: "center",
  },
  ageText: {
    color: Colors.accentPrimary,
    fontSize: 18,
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
    borderTopColor: Colors.border,
  },
  continueButton: {
    backgroundColor: Colors.accentPrimary,
    borderRadius: 12,
    paddingVertical: 16,
  },
});
