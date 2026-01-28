import { CountrySelectModal } from "@/src/components/country-select-modal";
import { DateInputCard } from "@/src/components/date-input-card";
import { ModeToggle } from "@/src/components/mode-toggle";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { useLoadingStore } from "@/src/store/loading-store";
import { useUserStore } from "@/src/store/user-store";
import {
  LIFE_CONSTANTS,
  calculateYearsBetween,
  getAgeLabel,
  getExpectedDeathDate,
  getLifeDateBounds,
  getYearLabel,
  isValidManualDeathDate,
} from "@/src/utils/user-stats";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModalScreen() {
  const { user, setUser } = useUserStore();
  const { setGlobalLoading } = useLoadingStore();

  const initialDOB = useMemo(
    () => (user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date()),
    [user?.dateOfBirth],
  );

  const initialManualDeathDate = useMemo(() => {
    if (user?.dateOfBirth && user?.lifeExpectancy) {
      return getExpectedDeathDate(
        new Date(user.dateOfBirth),
        user.lifeExpectancy,
      );
    }
    return getExpectedDeathDate(initialDOB, LIFE_CONSTANTS.DEFAULT_EXPECTANCY);
  }, [user, initialDOB]);

  const [name, setName] = useState(user?.name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initialDOB);
  const [country, setCountry] = useState(user?.country ?? "");
  const [countryLifeExpectancyState, setCountryLifeExpectancyState] = useState(
    user?.lifeExpectancy ?? 0,
  );
  const [isManualMode, setIsManualMode] = useState(
    user?.country === "Custom" || !user?.country,
  );
  const [manualDeathDate, setManualDeathDate] = useState(
    initialManualDeathDate,
  );

  const [showCountryModal, setShowCountryModal] = useState(false);

  const { minDate: minDeathDate, maxDate: maxDeathDate } = useMemo(
    () => getLifeDateBounds(dateOfBirth),
    [dateOfBirth],
  );

  const manualYears = calculateYearsBetween(dateOfBirth, manualDeathDate);
  const isManualValid = isValidManualDeathDate(dateOfBirth, manualDeathDate);

  const handleSave = useCallback(async () => {
    try {
      setGlobalLoading(true);
      if (!name.trim()) return console.error("Name is required");

      const lifeExpectancy = isManualMode
        ? manualYears
        : countryLifeExpectancyState;
      if (lifeExpectancy <= 0) return;

      await setUser({
        name,
        dateOfBirth,
        country: isManualMode ? "Custom" : country,
        lifeExpectancy,
      });

      router.back();
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setGlobalLoading(false, 1000);
    }
  }, [
    isManualMode,
    manualYears,
    countryLifeExpectancyState,
    name,
    dateOfBirth,
    country,
    setUser,
    setGlobalLoading,
  ]);

  const handleModeChange = useCallback(
    (value: string) => {
      const newIsManual = value === "manual";
      setIsManualMode(newIsManual);
      if (newIsManual) {
        const years =
          countryLifeExpectancyState > 0
            ? countryLifeExpectancyState
            : LIFE_CONSTANTS.DEFAULT_EXPECTANCY;
        setManualDeathDate(getExpectedDeathDate(dateOfBirth, years));
      }
    },
    [dateOfBirth, countryLifeExpectancyState],
  );

  const handleCountrySelect = useCallback(
    (name: string, expectancy: number) => {
      setCountry(name);
      setCountryLifeExpectancyState(expectancy);
    },
    [],
  );

  const modeOptions = useMemo(
    () => [
      {
        label: "By Country",
        value: "country",
        icon: (
          <Ionicons
            name="globe-outline"
            size={18}
            color={Colors.accentPrimary}
          />
        ),
      },
      {
        label: "Custom Date",
        value: "manual",
        icon: (
          <Ionicons
            name="pencil-outline"
            size={18}
            color={Colors.accentPrimary}
          />
        ),
      },
    ],
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LinearGradient
          colors={[Colors.surface, Colors.background]}
          style={styles.header}
        >
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text variant="subtitle" style={styles.title}>
            Edit Profile
          </Text>
          <View style={styles.placeholder} />
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <Text variant="body" style={styles.label}>
              Name
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.placeholder}
              maxLength={25}
            />
          </Card>

          <Card>
            <DateInputCard
              label="Date of birth"
              date={dateOfBirth}
              onDateChange={setDateOfBirth}
              maximumDate={new Date()}
              infoText={`You are ${getAgeLabel(dateOfBirth)}`}
            />
          </Card>

          <View style={styles.divider} />

          <Card>
            <Text variant="body" style={styles.label}>
              Life Expectancy Method
            </Text>
            <ModeToggle
              options={modeOptions}
              selectedValue={isManualMode ? "manual" : "country"}
              onValueChange={handleModeChange}
              style={styles.modeToggle}
            />
          </Card>

          {!isManualMode ? (
            <Card>
              <Text variant="body" style={styles.label}>
                Country
              </Text>
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

              {countryLifeExpectancyState > 0 && (
                <View style={styles.expectancyInfo}>
                  <Text style={styles.expectancyText}>
                    Expected lifespan: {countryLifeExpectancyState}{" "}
                    {getYearLabel(countryLifeExpectancyState)}
                  </Text>
                </View>
              )}
            </Card>
          ) : (
            <Card>
              <DateInputCard
                label="Choose your expected death date"
                date={manualDeathDate}
                onDateChange={setManualDeathDate}
                minimumDate={minDeathDate}
                maximumDate={maxDeathDate}
                infoText={
                  isManualValid
                    ? `Expected lifespan: ${manualYears} ${getYearLabel(
                        manualYears,
                      )}`
                    : "Please select a valid date"
                }
              />
            </Card>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={handleSave}>Save Changes</Button>
        </View>
      </KeyboardAvoidingView>

      <CountrySelectModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        selectedCountry={country}
        onCountrySelect={handleCountrySelect}
      />
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

  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  label: {
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
  modeToggle: { marginBottom: 0 },

  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.inputBackground,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceSecondary,
  },
  countrySelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  countrySelectorText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  countrySelectorPlaceholder: {
    color: Colors.placeholder,
  },
  expectancyInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    alignItems: "center",
  },
  expectancyText: {
    color: Colors.accentPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
