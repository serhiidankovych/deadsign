import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/src/constants/colors";
import { countries } from "@/src/data/countries";
import { Card } from "./ui/card";
import { Text } from "./ui/text";

type Props = {
  dateOfBirth: Date;
  country: string;
  isManualMode: boolean;
  manualDeathDate: Date;
  onCountryChange: (country: string) => void;
  onIsManualModeChange: (isManual: boolean) => void;
  onManualDeathDateChange: (date: Date) => void;
};

export const LifeExpectancySelector = ({
  dateOfBirth,
  country,
  isManualMode,
  manualDeathDate,
  onCountryChange,
  onIsManualModeChange,
  onManualDeathDateChange,
}: Props) => {
  const [showManualPicker, setShowManualPicker] = useState(false);

  const calculateExpectedYears = () =>
    Math.floor(
      (manualDeathDate.getTime() - dateOfBirth.getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
    );

  return (
    <View>
      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.toggleButton, !isManualMode && styles.toggleActive]}
          onPress={() => onIsManualModeChange(false)}
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
          style={[styles.toggleButton, isManualMode && styles.toggleActive]}
          onPress={() => onIsManualModeChange(true)}
        >
          <Text
            style={[styles.toggleText, isManualMode && styles.toggleTextActive]}
          >
            Manual Date
          </Text>
        </Pressable>
      </View>

      {!isManualMode ? (
        <Card style={styles.section}>
          <Text variant="body" style={styles.sectionLabel}>
            Choose Your Country
          </Text>
          <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled={true}>
            {countries.map((item) => (
              <Pressable
                key={item.name}
                style={[
                  styles.countryItem,

                  country === item.name && styles.countrySelected,
                ]}
                onPress={() => onCountryChange(item.name)}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.expectancyText}>
                    Life Expectancy: {item.lifeExpectancy} years
                  </Text>
                </View>

                {country === item.name && <Text style={styles.check}>✓</Text>}
              </Pressable>
            ))}
          </ScrollView>
        </Card>
      ) : (
        <Card style={styles.section}>
          <Text variant="body" style={styles.sectionLabel}>
            Choose Your Death Date
          </Text>

          <Pressable
            style={styles.dateButton}
            onPress={() => setShowManualPicker(true)}
          >
            <Text style={styles.dateText}>
              {manualDeathDate.toLocaleDateString()}
            </Text>
            <Text style={styles.dateHint}>Tap to change</Text>
          </Pressable>

          {showManualPicker && (
            <DateTimePicker
              value={manualDeathDate}
              mode="date"
              display="default"
              minimumDate={
                new Date(dateOfBirth.getTime() + 1000 * 60 * 60 * 24 * 365)
              }
              onChange={(e, selected) => {
                setShowManualPicker(false);

                if (selected) onManualDeathDateChange(selected);
              }}
            />
          )}

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Expected lifespan: {calculateExpectedYears()} years
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: Colors.accentPrimary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.background,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  countryItem: {
    flexDirection: "row",
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 10,
    borderColor: "transparent",
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
  },
  countrySelected: {
    borderColor: Colors.accentPrimary,
    backgroundColor: Colors.surface,
  },
  flag: { fontSize: 26, marginRight: 16 },
  countryInfo: { flex: 1 },
  countryName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  expectancyText: { color: Colors.textSecondary, marginTop: 4 },
  check: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.accentPrimary,
  },
  dateButton: {
    padding: 16,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    alignItems: "center",
  },
  dateText: { fontSize: 18, color: Colors.textPrimary, marginBottom: 4 },
  dateHint: { fontSize: 14, color: Colors.textSecondary },
  summary: {
    padding: 12,
    marginTop: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryText: {
    fontWeight: "600",
    color: Colors.accentPrimary,
    fontSize: 16,
  },
});
