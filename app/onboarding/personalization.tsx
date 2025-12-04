import { useOnboardingStore } from "@/src/features/onboarding/store/onboarding-store";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router } from "expo-router";

import React, { useState } from "react";
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";

export default function PersonalizationScreen() {
  const { onboardingData, updateOnboardingData } = useOnboardingStore();
  const [name, setName] = useState(onboardingData.name || "");
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    if (name.trim()) {
      updateOnboardingData({ name: name.trim() });
      router.push("/onboarding/final" as RelativePathString);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/intro-background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top,
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
          >
            {/* HEADER CONTENT */}
            <View style={styles.content}>
              <View style={styles.header}>
                <Text variant="title" style={styles.title}>
                  What&apos;s your name?
                </Text>

                <Text variant="subtitle" style={styles.subtitle}>
                  We personalize your journey starting from this little spark.
                </Text>
              </View>
            </View>

            {/* FOOTER WITH INPUT + BUTTON */}
            <View style={styles.footer}>
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)", Colors.background]}
                style={styles.gradient}
              />

              <View
                style={[
                  styles.inputButtonContainer,
                  {
                    paddingBottom: insets.bottom + 20,
                  },
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />

                <Button onPress={handleContinue} disabled={!name.trim()}>
                  Continue
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  /** CONTENT AREA */
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
    opacity: 0.9,
    maxWidth: 320,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  inputButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceSecondary,
    gap: 12,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    padding: 16,
    borderRadius: 12,
    color: Colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceSecondary,
  },
});
