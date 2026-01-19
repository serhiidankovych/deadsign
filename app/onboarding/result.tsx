import { OnboardingLayout } from "@/src/components/layout/onboarding-layout";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useOnboardingStore } from "@/src/features/onboarding/store/onboarding-store";
import { getUserLifeStats } from "@/src/utils/user-stats";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const GRID_GAP = 12;

export default function ResultScreen() {
  const { onboardingData } = useOnboardingStore();

  if (!onboardingData.dateOfBirth || !onboardingData.lifeExpectancy) {
    return null;
  }

  const { age, weeksLived, remainingWeeks } = getUserLifeStats(
    onboardingData.dateOfBirth,
    onboardingData.lifeExpectancy,
  );

  const stats = [
    {
      label: "Current Age",
      value: age.toString(),
      colSpan: 1,
    },
    {
      label: "Life Expectancy",
      value: onboardingData.lifeExpectancy.toString(),
      colSpan: 1,
    },
    {
      label: "Weeks Lived",
      value: weeksLived.toLocaleString(),
      colSpan: 2,
    },
    {
      label: "Weeks Remaining",
      value: remainingWeeks.toLocaleString(),
      colSpan: 2,
      highlight: true,
    },
  ];

  return (
    <OnboardingLayout
      backgroundImage={require("../../assets/images/backgroud-intro.png")}
      title="Your Life Journey"
      subtitle="A clear snapshot of where you are right now"
      onNext={() =>
        router.push("/onboarding/personalization" as RelativePathString)
      }
      nextLabel="Continue Setup"
      currentStep={4}
      totalSteps={6}
    >
      <View style={styles.gridContainer}>
        {stats.map((item) => (
          <View
            key={item.label}
            style={[
              styles.gridItem,
              item.colSpan === 2 ? styles.colSpan2 : styles.colSpan1,
            ]}
          >
            <Card>
              <View style={styles.cardContent}>
                <Text variant="caption" style={styles.statLabel}>
                  {item.label}
                </Text>

                <View style={styles.valueRow}>
                  <Text variant="body" style={styles.statValue}>
                    {item.value}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    marginBottom: 24,
  },

  gridItem: {},

  colSpan1: {
    width: "48%",
    flexGrow: 1,
  },

  colSpan2: {
    width: "100%",
  },

  cardContent: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
  },

  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: "center",
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },

  statValue: {
    fontSize: 32,
    color: Colors.textSecondary,
    fontWeight: "800",
  },

  statUnit: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
});
