import { DateInputCard } from "@/src/components/date-input-card";
import { OnboardingLayout } from "@/src/components/layout/onboarding-layout";
import { calculateAge } from "@/src/utils/user-stats";
import { RelativePathString, router } from "expo-router";
import React, { useState } from "react";
import { useOnboardingStore } from "../../src/features/onboarding/store/onboarding-store";

export default function DateOfBirthScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [dateOfBirth, setDateOfBirth] = useState(
    onboardingData.dateOfBirth || new Date()
  );

  const age = calculateAge(dateOfBirth);
  const isValidAge = age >= 0 && age <= 120;

  const handleContinue = () => {
    if (isValidAge) {
      updateOnboardingData({ dateOfBirth });
      router.push("/onboarding/life-expectancy" as RelativePathString);
    }
  };

  return (
    <OnboardingLayout
      backgroundImage={require("../../assets/images/backgroud-bottom.png")}
      title="When Were You Born?"
      subtitle="This helps us calculate your life calendar"
      onNext={handleContinue}
      nextDisabled={!isValidAge}
      currentStep={2}
      totalSteps={6}
    >
      <DateInputCard
        label="Select Your Date of Birth"
        date={dateOfBirth}
        onDateChange={setDateOfBirth}
        maximumDate={new Date()}
        infoText={
          isValidAge
            ? ` You are ${age} years old`
            : "Please select a valid date"
        }
      />
    </OnboardingLayout>
  );
}
