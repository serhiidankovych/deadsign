import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router } from "expo-router";
import React from "react";
import { Image, ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";
import { Button } from "../../src/components/ui/button";
import { Text } from "../../src/components/ui/text";

export default function IntroScreen() {
  return (
    <ImageBackground
      source={require("../../assets/images/intro-background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/deadsign.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="title" style={styles.title}>
              Deadsign
            </Text>
            <Text variant="subtitle" style={styles.subtitle}>
              The app for planning the most important thing —{" "}
              <Text variant="body" style={styles.highlight}>
                your life.{" "}
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <LinearGradient
            colors={["transparent", "rgba(14, 13, 13, 0.8)", Colors.background]}
            style={styles.gradient}
          />
          <View style={styles.buttonContainer}>
            <Button
              onPress={() =>
                router.push("/onboarding/date-of-birth" as RelativePathString)
              }
            >
              Get Started
            </Button>
          </View>
        </View>
      </SafeAreaView>
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
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: "center",
    paddingBottom: 20,
  },
  logo: {
    width: 270,
    height: 270,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.textPrimary,
    textAlign: "center",
    fontSize: 20,
    lineHeight: 26,
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  highlight: {
    fontSize: 20,
    color: Colors.accentPrimary,
    fontWeight: "bold",
    fontStyle: "italic",
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
    height: 250,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
});
