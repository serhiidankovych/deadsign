import { Colors } from "@/src/constants/colors";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface GlobalLoadingOverlayProps {
  visible: boolean;
}

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({
  visible,
}) => {
  const fadeAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0.5,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <LottieView
        source={require("../../assets/images/deadsign.json")}
        autoPlay
        loop
        style={styles.lottie}
      />

      <Animated.Text
        style={[
          styles.label,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        Refreshing Life Table
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  label: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.textPrimary,
    opacity: 0.8,
    fontWeight: "500",
  },
});
