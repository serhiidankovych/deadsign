// app/modal.tsx
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

import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/src/components/ui/button";
import { Colors } from "@/src/constants/colors";
import { useUserStore } from "@/src/store/user-store";
import { calculateLifeExpectancy } from "@/src/utils/life-expactancy";

export default function ModalScreen() {
  const { user, setUser } = useUserStore();

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [country, setCountry] = useState("Ukraine");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const countries = [
    { name: "Ukraine", flag: "🇺🇦" },
    { name: "United States", flag: "🇺🇸" },
    { name: "Germany", flag: "🇩🇪" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "United Kingdom", flag: "🇬🇧" },
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setDateOfBirth(user.dateOfBirth || new Date());
      setCountry(user.country || "Ukraine");
    }
  }, [user]);

  const handleSave = () => {
    const lifeExpectancy = calculateLifeExpectancy(dateOfBirth, country);
    setUser({
      name,
      dateOfBirth,
      country,
      lifeExpectancy,
    });
    router.back();
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {dateOfBirth.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={20} color={Colors.textMuted} />
          </Pressable>
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={styles.sectionLabel}>
            Country
          </Text>
          <View style={styles.countryList}>
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
                <Text
                  style={[
                    styles.countryName,
                    country === item.name && styles.countryNameSelected,
                  ]}
                >
                  {item.name}
                </Text>
                {country === item.name && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.accentPrimary}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Card>

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
  dateButton: {
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
  countryList: {
    gap: 8,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  countryItemSelected: {
    borderColor: Colors.selectedBorder,
    backgroundColor: Colors.selectedBackground,
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  countryNameSelected: {
    color: Colors.accentPrimary,
  },
  saveButton: {
    marginTop: 20,
  },
});
