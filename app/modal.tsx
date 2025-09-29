import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";

import { Button } from "@/src/components/ui/button";
import { useUserStore } from "@/src/store/user-store";
import { calculateLifeExpectancy } from "@/src/utils/life-expactancy";

export default function ModalScreen() {
  const { user, setUser } = useUserStore();

  const [name, setName] = useState(user?.name || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth || new Date()
  );
  const [country, setCountry] = useState(user?.country || "Ukraine");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const countries = [
    { name: "Ukraine", flag: "🇺🇦" },
    { name: "United States", flag: "🇺🇸" },
    { name: "Germany", flag: "🇩🇪" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "United Kingdom", flag: "🇬🇧" },
  ];

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
          <Ionicons name="close" size={24} color="#FFF" />
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
            placeholderTextColor="#666"
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
            <Ionicons name="calendar" size={20} color="#666" />
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
                  <Ionicons name="checkmark" size={20} color="#FAFF00" />
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
    backgroundColor: "#0E0D0D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: "#FFF",
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
    color: "#999",
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
    color: "#FFF",
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    color: "#FFF",
    fontSize: 16,
  },
  countryList: {
    gap: 8,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#333",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  countryItemSelected: {
    borderColor: "#FAFF00",
    backgroundColor: "#2A2A00",
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
  },
  countryNameSelected: {
    color: "#FAFF00",
  },
  saveButton: {
    marginTop: 20,
  },
});
