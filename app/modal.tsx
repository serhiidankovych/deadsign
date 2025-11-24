import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import { countries } from "@/src/data/countries";
import { useUserStore } from "@/src/store/user-store";
import { calculateLifeExpectancy } from "@/src/utils/life-expactancy";

export default function ModalScreen() {
  const { user, setUser } = useUserStore();

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [country, setCountry] = useState("Ukraine");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualDeathDate, setManualDeathDate] = useState(() => {
    const defaultDate = new Date(dateOfBirth);
    defaultDate.setFullYear(defaultDate.getFullYear() + 80);
    return defaultDate;
  });
  const [showManualDatePicker, setShowManualDatePicker] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setDateOfBirth(user.dateOfBirth || new Date());
      setCountry(user.country || "Ukraine");
    }
  }, [user]);

  const handleSave = async () => {
    const lifeExpectancy = isManualMode
      ? Math.floor(
          (manualDeathDate.getTime() - dateOfBirth.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
        )
      : calculateLifeExpectancy(dateOfBirth, country);

    await setUser({
      name,
      dateOfBirth,
      country,
      lifeExpectancy,
    });
    router.back();
  };

  const calculateExpectedYears = () =>
    Math.floor(
      (manualDeathDate.getTime() - dateOfBirth.getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
    );

  const calculateCurrentAge = (dob: Date) => {
    return Math.floor(
      (new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
  };

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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text variant="subtitle" style={styles.title}>
          Edit Profile
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <Card style={styles.section}>
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

        <Card style={styles.section}>
          <Text variant="body" style={styles.sectionLabel}>
            Date of Birth
          </Text>
          <Pressable
            style={styles.dateInputButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {dateOfBirth.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={20} color={Colors.textMuted} />
          </Pressable>
          {/* ADDED: Display current age which updates dynamically */}
          <View style={styles.ageDisplay}>
            <Text style={styles.ageText}>
              Current age: {calculateCurrentAge(dateOfBirth)} years
            </Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={styles.sectionLabel}>
            Life Expectancy
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
            <View style={styles.countryContainer}>
              <ScrollView
                style={styles.countryScrollView}
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
          ) : (
            <>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowManualDatePicker(true)}
              >
                <Text style={styles.manualDateText}>
                  {manualDeathDate.toLocaleDateString()}
                </Text>
                <Text style={styles.dateHint}>Tap to change death date</Text>
              </Pressable>
              <View style={styles.selectionSummary}>
                <Text style={styles.summaryText}>
                  Expected lifespan: {calculateExpectedYears()} years
                </Text>
              </View>
            </>
          )}
        </Card>

        {/* ADDED: Date of birth picker functionality */}
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

        <Button onPress={handleSave} style={styles.saveButton}>
          Save Changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: Colors.inputBackground,
    padding: 16,
    borderRadius: 12,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  dateInputButton: {
    backgroundColor: Colors.inputBackground,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: "600",
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
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
    maxHeight: 250,
  },
  countryScrollView: {},
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
    fontSize: 24,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  countryNameSelected: {
    color: Colors.accentPrimary,
  },
  lifeExpectancyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
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
  dateButton: {
    backgroundColor: Colors.inputBackground,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surfaceSecondary,
  },
  manualDateText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateHint: {
    color: Colors.textSecondary,
    fontSize: 14,
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
  saveButton: {
    marginTop: 20,
  },
});
