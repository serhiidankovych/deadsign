import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RelativePathString, router } from "expo-router";
import { Text } from "../../src/components/ui/text";
import { Button } from "../../src/components/ui/button";
import { Card } from "../../src/components/ui/card";
import { useOnboardingStore } from "@/src/store/onboarding-store";

export default function ResultScreen() {
  const { onboardingData } = useOnboardingStore();

  if (!onboardingData.dateOfBirth || !onboardingData.lifeExpectancy) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="title" style={styles.errorTitle}>
            Incomplete Data
          </Text>
          <Text variant="body" style={styles.errorMessage}>
            Please complete the onboarding process first.
          </Text>
          <Button
            onPress={() => router.push("/onboarding" as RelativePathString)}
            style={styles.backButton}
          >
            Back to Onboarding
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const currentAge = Math.floor(
    (new Date().getTime() - onboardingData.dateOfBirth.getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );

  const weeksLived = Math.floor(
    (new Date().getTime() - onboardingData.dateOfBirth.getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );

  const totalWeeks = onboardingData.lifeExpectancy * 52;
  const remainingWeeks = totalWeeks - weeksLived;
  const lifeProgress = (weeksLived / totalWeeks) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text variant="title" style={styles.title}>
              Your Life Journey
            </Text>
          </View>

          <Card style={styles.mainStatsCard}>
            <View style={styles.progressSection}>
              <Text variant="body" style={styles.progressLabel}>
                Life Progress
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(lifeProgress, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {lifeProgress.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="body" style={styles.statLabel}>
                  Current Age
                </Text>
                <Text variant="subtitle" style={styles.statValue}>
                  {currentAge}
                </Text>
                <Text style={styles.statUnit}>years</Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="body" style={styles.statLabel}>
                  Life Expectancy
                </Text>
                <Text variant="subtitle" style={styles.statValue}>
                  {onboardingData.lifeExpectancy}
                </Text>
                <Text style={styles.statUnit}>years</Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="body" style={styles.statLabel}>
                  Weeks Lived
                </Text>
                <Text variant="subtitle" style={styles.statValue}>
                  {weeksLived.toLocaleString()}
                </Text>
                <Text style={styles.statUnit}>weeks</Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="body" style={styles.statLabel}>
                  Weeks Remaining
                </Text>
                <Text variant="subtitle" style={styles.statValue}>
                  {remainingWeeks.toLocaleString()}
                </Text>
                <Text style={styles.statUnit}>weeks</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.previewCard}>
            <Text variant="body" style={styles.previewLabel}>
              Life Visualization Preview
            </Text>
            <Text style={styles.previewDescription}>
              Each dot represents approximately {Math.round(totalWeeks / 100)}{" "}
              weeks
            </Text>
            <View style={styles.miniLifeTable}>
              {Array.from({ length: 100 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.miniWeek,
                    index < (weeksLived / totalWeeks) * 100 &&
                      styles.miniWeekLived,
                  ]}
                />
              ))}
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotLived]} />
                <Text style={styles.legendText}>Lived</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotRemaining]} />
                <Text style={styles.legendText}>Remaining</Text>
              </View>
            </View>
          </Card>
          <View style={styles.spacer} />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button
            onPress={() =>
              router.push("/onboarding/personalization" as RelativePathString)
            }
            style={styles.nextButton}
          >
            Continue Setup
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0D0D",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
  },
  title: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#999",
    textAlign: "center",
    fontSize: 16,
  },
  mainStatsCard: {
    marginBottom: 24,
    padding: 24,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FAFF00",
    borderRadius: 4,
  },
  progressText: {
    color: "#FAFF00",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 45,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
  },
  statLabel: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  statValue: {
    color: "#FAFF00",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statUnit: {
    color: "#666",
    fontSize: 12,
  },
  previewCard: {
    marginBottom: 24,
    padding: 24,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
  },
  previewLabel: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  previewDescription: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  miniLifeTable: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginBottom: 16,
    justifyContent: "center",
  },
  miniWeek: {
    width: 10,
    height: 10,
    backgroundColor: "#333",
    borderRadius: 2,
  },
  miniWeekLived: {
    backgroundColor: "#FAFF00",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendDotLived: {
    backgroundColor: "#FAFF00",
  },
  legendDotRemaining: {
    backgroundColor: "#333",
  },
  legendText: {
    color: "#999",
    fontSize: 14,
  },
  infoCard: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    alignItems: "center",
  },
  infoLabel: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
  },
  countryText: {
    color: "#FAFF00",
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
    backgroundColor: "#0E0D0D",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  nextButton: {
    backgroundColor: "#FAFF00",
    borderRadius: 12,
    paddingVertical: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    color: "#FAFF00",
    textAlign: "center",
    marginBottom: 16,
  },
  errorMessage: {
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    minWidth: 200,
    backgroundColor: "#FAFF00",
  },
});
