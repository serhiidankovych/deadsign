import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import { useLifeTableCache } from "../hooks/use-life-table-cache";
import { useLifeTableData } from "../hooks/use-life-table-data";
import type { LifeTableProps } from "../types";
import { CachedImage } from "./cached-image";
import { LifeTableCanvas } from "./life-table-canvas";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface LifeTablePropsWithCallback extends LifeTableProps {
  onLoadingChange?: (isLoading: boolean) => void;
  isFullScreen?: boolean;
}

export const LifeTable: React.FC<LifeTablePropsWithCallback> = ({
  user,
  onLoadingChange,
  isFullScreen = false,
}) => {
  const viewShotRef = useRef<ViewShot>(null);
  const opacity = useSharedValue(0);
  const tableData = useLifeTableData(user);

  const aspectRatio = tableData.fullWidth / tableData.fullHeight;

  const containerWidth = isFullScreen ? SCREEN_WIDTH : SCREEN_WIDTH - 32;

  const renderHeight = containerWidth / aspectRatio;
  const renderWidth = containerWidth;

  const shouldCenterVertically = isFullScreen && renderHeight < SCREEN_HEIGHT;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const [currentScale, setCurrentScale] = useState(1);

  const { cachedImageUri, isReadyToCapture } = useLifeTableCache(
    user,
    tableData,
    viewShotRef as RefObject<ViewShot>
  );

  useEffect(() => {
    onLoadingChange?.(!cachedImageUri || isReadyToCapture);
  }, [cachedImageUri, isReadyToCapture, onLoadingChange]);

  useEffect(() => {
    if (cachedImageUri && !isReadyToCapture) {
      opacity.value = withTiming(1, { duration: 400 });
    }
  }, [cachedImageUri, isReadyToCapture]);

  const resetZoom = useCallback(() => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setCurrentScale(1);
  }, []);

  useEffect(() => {
    resetZoom();
  }, [isFullScreen, resetZoom]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        savedScale.value = scale.value;
      }
      runOnJS(setCurrentScale)(scale.value);
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.5) {
        runOnJS(resetZoom)();
      } else {
        scale.value = withSpring(3);
        savedScale.value = 3;
        runOnJS(setCurrentScale)(3);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    width: renderWidth,
    height: renderHeight,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const composedGesture = Gesture.Race(
    doubleTap,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  return (
    <GestureHandlerRootView
      style={[
        styles.container,

        { minHeight: isFullScreen ? SCREEN_HEIGHT : renderHeight },
      ]}
    >
      {cachedImageUri && !isReadyToCapture && (
        <Animated.View style={[styles.wrapper, { opacity }]}>
          <View
            style={[
              styles.contentAlignment,
              {
                justifyContent: shouldCenterVertically
                  ? "center"
                  : "flex-start",

                paddingTop: isFullScreen && !shouldCenterVertically ? 60 : 0,
              },
            ]}
          >
            <GestureDetector gesture={composedGesture}>
              <Animated.View style={animatedStyle}>
                <CachedImage
                  uri={cachedImageUri}
                  width={renderWidth}
                  height={renderHeight}
                />
              </Animated.View>
            </GestureDetector>
          </View>

          {isFullScreen && (
            <View style={styles.controlsContainer}>
              {currentScale > 1.1 && (
                <View style={styles.zoomIndicator}>
                  <Text style={styles.zoomText}>
                    {currentScale.toFixed(1)}x
                  </Text>
                </View>
              )}

              <View style={styles.zoomButtons}>
                <TouchableOpacity
                  onPress={() => {
                    const newScale = Math.max(1, currentScale - 1);
                    scale.value = withSpring(newScale);
                    savedScale.value = newScale;
                    setCurrentScale(newScale);
                  }}
                  style={styles.circleBtn}
                >
                  <Ionicons name="remove" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const newScale = Math.min(5, currentScale + 1);
                    scale.value = withSpring(newScale);
                    savedScale.value = newScale;
                    setCurrentScale(newScale);
                  }}
                  style={styles.circleBtn}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      )}

      {isReadyToCapture && (
        <View style={styles.captureContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{ format: "png", quality: 1.0 }}
            style={{ width: tableData.fullWidth, height: tableData.fullHeight }}
          >
            <LifeTableCanvas user={user} tableData={tableData} />
          </ViewShot>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  wrapper: {
    flex: 1,
  },
  contentAlignment: {
    flex: 1,
    alignItems: "center",
  },
  captureContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT + 1000,
    left: 0,
    opacity: 0,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  zoomIndicator: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  zoomText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  zoomButtons: {
    flexDirection: "row",
    gap: 20,
  },
  circleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
