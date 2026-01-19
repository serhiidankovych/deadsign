import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import React from "react";
import {
  Animated,
  ImageBackground,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OnboardingLayoutProps {
  backgroundImage: ImageSourcePropType;
  children: React.ReactNode;
  onNext: () => void;

  title?: string;
  subtitle?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  contentContainerStyle?: ViewStyle;
  currentStep?: number;
  totalSteps?: number;
  scrollEnabled?: boolean;
  disableScroll?: boolean;
}

export const OnboardingLayout = ({
  backgroundImage,
  children,
  title,
  subtitle,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  showSkip = false,
  onSkip,
  contentContainerStyle,
  currentStep,
  totalSteps,
  scrollEnabled = true,
  disableScroll = false,
}: OnboardingLayoutProps) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const headerContent = (title || subtitle) && (
    <View style={styles.header}>
      {title && (
        <Text variant="title" style={styles.title}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text variant="subtitle" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const mainContent = (
    <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
      {headerContent}
      {children}
    </Animated.View>
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.container, { paddingTop: insets.top }]}
        keyboardVerticalOffset={0}
      >
        {disableScroll ? (
          <View style={[styles.scrollContent, contentContainerStyle]}>
            {mainContent}
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            scrollEnabled={scrollEnabled}
          >
            {mainContent}
          </ScrollView>
        )}

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Button
            onPress={onNext}
            disabled={nextDisabled}
            style={styles.button}
          >
            {nextLabel}
          </Button>

          {showSkip && onSkip && (
            <TouchableOpacity
              onPress={onSkip}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          )}

          {currentStep !== undefined && totalSteps !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index < currentStep && styles.progressDotActive,
                      index === currentStep && styles.progressDotCurrent,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingVertical: 4,
    alignItems: "center",
  },
  progressTrack: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSecondary,
  },
  progressDotActive: {
    backgroundColor: Colors.accentPrimary,
    width: 24,
  },
  progressDotCurrent: {
    backgroundColor: Colors.accentPrimary,
    width: 12,
    opacity: 0.6,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 160,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    width: "100%",
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
});
