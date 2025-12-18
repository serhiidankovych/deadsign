import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CountrySelector } from "@/src/components/country-selector";
import { DateInputCard } from "@/src/components/date-input-card";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useLoadingStore } from "@/src/store/loading-store";
import { useUserStore } from "@/src/store/user-store";
import { calculateAge } from "@/src/utils/user-stats";

export default function ModalScreen() {
  const { user, setUser } = useUserStore();
  const { setGlobalLoading } = useLoadingStore();

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [country, setCountry] = useState("");
  const [countryLifeExpectancy, setCountryLifeExpectancy] = useState(0);

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualDeathDate, setManualDeathDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 80);
    return defaultDate;
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setDateOfBirth(user.dateOfBirth || new Date());
      setCountry(user.country || "");
      setCountryLifeExpectancy(user.lifeExpectancy || 0);
    }
  }, [user]);

  const handleSave = async () => {
    setGlobalLoading(true);
    const lifeExpectancy = isManualMode
      ? Math.floor(
          (manualDeathDate.getTime() - dateOfBirth.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
        )
      : countryLifeExpectancy;

    await setUser({ name, dateOfBirth, country, lifeExpectancy });
    router.back();
  };

  const handleCountrySelect = (countryName: string, lifeExpectancy: number) => {
    setCountry(countryName);
    setCountryLifeExpectancy(lifeExpectancy);
  };

  const calculateExpectedYears = () =>
    Math.floor(
      (manualDeathDate.getTime() - dateOfBirth.getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
    );

  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    if (!isManualMode) {
      const defaultDeathDate = new Date(dateOfBirth);
      defaultDeathDate.setFullYear(defaultDeathDate.getFullYear() + 80);
      setManualDeathDate(defaultDeathDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text variant="subtitle" style={styles.title}>
            Edit Profile
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.staticSection}>
            <Card style={styles.card}>
              <Text variant="body" style={styles.sectionLabel}>
                Name
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.placeholder}
              />
            </Card>

            <DateInputCard
              label="Date of Birth"
              date={dateOfBirth}
              onDateChange={setDateOfBirth}
              maximumDate={new Date()}
              infoText={`Age: ${calculateAge(dateOfBirth)}`}
            />
          </View>

          <Card style={styles.flexibleCard}>
            <Text variant="body" style={styles.sectionLabel}>
              Life Expectancy Setup
            </Text>

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
              <CountrySelector
                selectedCountry={country}
                onCountrySelect={handleCountrySelect}
                style={{ flex: 1 }}
              />
            ) : (
              <DateInputCard
                label="Death Date"
                date={manualDeathDate}
                onDateChange={setManualDeathDate}
                minimumDate={
                  new Date(dateOfBirth.getTime() + 365 * 24 * 60 * 60 * 1000)
                }
                infoText={`Lifespan: ${calculateExpectedYears()} yrs`}
              />
            )}
          </Card>
        </View>

        <View style={styles.footer}>
          <Button onPress={handleSave}>Save Changes</Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: { padding: 4 },
  title: { color: Colors.textPrimary },
  placeholder: { width: 32 },

  contentContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  staticSection: {
    gap: 16,
  },
  card: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  flexibleCard: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  sectionLabel: {
    color: Colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: Colors.inputBackground,
    padding: 12,
    borderRadius: 12,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonActive: { backgroundColor: Colors.accentPrimary },
  toggleText: { color: Colors.textSecondary, fontWeight: "600" },
  toggleTextActive: { color: Colors.background },

  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
