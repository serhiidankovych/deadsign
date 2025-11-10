import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useOnboardingStore } from "@/src/features/onboarding/store/onboarding-store";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    backgroundColor: Colors.background,
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
  mainStatsCard: {
    marginBottom: 24,
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    color: Colors.textPrimary,
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
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accentPrimary,
    borderRadius: 4,
  },
  progressText: {
    color: Colors.accentPrimary,
    fontSize: 14,
    fontWeight: "600",
    minWidth: 45,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceSecondary,
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
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  statValue: {
    color: Colors.accentPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statUnit: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  previewCard: {
    marginBottom: 24,
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  previewLabel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  previewDescription: {
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 2,
  },
  miniWeekLived: {
    backgroundColor: Colors.accentPrimary,
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
    backgroundColor: Colors.accentPrimary,
  },
  legendDotRemaining: {
    backgroundColor: Colors.surfaceSecondary,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: 14,
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
  nextButton: {
    backgroundColor: Colors.accentPrimary,
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
    color: Colors.accentPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  errorMessage: {
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    minWidth: 200,
    backgroundColor: Colors.accentPrimary,
  },
});
