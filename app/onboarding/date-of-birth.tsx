import { RelativePathString, router } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

import { DateInputCard } from "@/src/components/date-input-card";
import { OnboardingLayout } from "@/src/components/layout/onboarding-layout";
import { Colors } from "@/src/constants/colors";
import { useOnboardingStore } from "@/src/features/onboarding/store/onboarding-store";
import { getAgeLabel, isValidAge } from "@/src/utils/user-stats";

export default function DateOfBirthScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();

  const [dateOfBirth, setDateOfBirth] = useState<Date>(
    onboardingData.dateOfBirth
      ? new Date(onboardingData.dateOfBirth)
      : new Date(),
  );

  const validAge = isValidAge(dateOfBirth);

  const handleContinue = () => {
    if (!validAge) return;

    updateOnboardingData({ dateOfBirth });
    router.push("/onboarding/life-expectancy" as RelativePathString);
  };

  return (
    <OnboardingLayout
      backgroundImage={require("../../assets/images/backgroud-bottom.png")}
      title="When Were You Born?"
      subtitle="This helps us calculate your life calendar"
      onNext={handleContinue}
      nextDisabled={!validAge}
      currentStep={2}
      totalSteps={6}
    >
      <DateInputCard
        label="Date of birth"
        date={dateOfBirth}
        onDateChange={setDateOfBirth}
        maximumDate={new Date()}
        infoText={
          validAge
            ? `You are ${getAgeLabel(dateOfBirth)}`
            : "Please select a valid date"
        }
      />

      <View style={{ marginTop: 12, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 12,
            color: Colors.textMuted,
            textAlign: "center",
          }}
        >
          Your data stays on your device.
        </Text>
      </View>
    </OnboardingLayout>
  );
}
