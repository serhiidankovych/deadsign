import { Colors } from "@/src/constants/colors";
import React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const Loading = ({ text = "Loading" }: { text?: string }) => {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.Text
        style={[
          {
            fontSize: 18,
            color: Colors.textSecondary,
          },
          animatedStyle,
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
};
