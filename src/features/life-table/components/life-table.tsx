import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";

import { File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
} from "react-native-reanimated";

import { useLifeTableData } from "../hooks/use-life-table-data";
import type { LifeTableProps } from "../types";
import {
  CANVAS_PADDING,
  LifeTableCanvas,
  LifeTableCanvasRef,
} from "./life-table-canvas";

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
  const canvasRef = useRef<LifeTableCanvasRef>(null);
  const tableData = useLifeTableData(user);

  const [isSaving, setIsSaving] = useState(false);

  const NORMAL_MODE_PADDING = 8;

  const canvasVisualWidth =
    tableData.fullWidth + CANVAS_PADDING.LEFT + CANVAS_PADDING.RIGHT;
  const canvasVisualHeight =
    tableData.fullHeight + CANVAS_PADDING.TOP + CANVAS_PADDING.BOTTOM;

  const aspectRatio = canvasVisualWidth / canvasVisualHeight;

  const containerWidth = isFullScreen
    ? SCREEN_WIDTH
    : SCREEN_WIDTH - 32 - NORMAL_MODE_PADDING * 2;

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

  useEffect(() => {
    requestAnimationFrame(() => {
      onLoadingChange?.(false);
    });
  }, [onLoadingChange]);

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

  const generateFile = async (): Promise<string | null> => {
    try {
      const base64Data = await canvasRef.current?.makeImage();
      if (!base64Data) return null;

      const cleanBase64 = base64Data.split("base64,")[1];

      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const file = new File(Paths.document, "life-table.png");
      await file.write(bytes);

      return file.uri;
    } catch (error) {
      console.error("Error generating file:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to save photos.");
        return;
      }

      const fileUri = await generateFile();
      if (fileUri) {
        await MediaLibrary.saveToLibraryAsync(fileUri);

        try {
          const file = new File(Paths.document, "life-table.png");
          await file.delete();
        } catch (cleanupError) {
          console.log("Cleanup error (non-critical):", cleanupError);
        }

        Alert.alert("Saved", "Your Life Table has been saved to your photos!");
      } else {
        Alert.alert("Error", "Could not generate image.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save image.");
    } finally {
      setIsSaving(false);
    }
  };

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
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.wrapper}>
        <View
          style={[
            styles.contentAlignment,
            {
              justifyContent: shouldCenterVertically ? "center" : "flex-start",
              padding: 16,
            },
          ]}
        >
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={animatedStyle}>
              <View
                style={{
                  width: canvasVisualWidth,
                  height: canvasVisualHeight,
                  transform: [{ scale: renderWidth / canvasVisualWidth }],
                  transformOrigin: "top left",
                  overflow: "visible",
                }}
              >
                <View style={styles.tableContainer}>
                  <LifeTableCanvas
                    ref={canvasRef}
                    user={user}
                    tableData={tableData}
                  />
                </View>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        {isFullScreen && (
          <View style={styles.bottomControls}>
            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.textPrimary} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="download-outline"
                      size={22}
                      color={Colors.textPrimary}
                    />
                    <Text style={styles.actionButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Zoom Indicator */}
            {currentScale > 1.1 && (
              <View style={styles.zoomIndicator}>
                <Text style={styles.zoomText}>{currentScale.toFixed(1)}x</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

LifeTable.displayName = "LifeTable";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  wrapper: {
    flex: 1,
  },
  contentAlignment: {
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
  },
  tableContainer: {},

  bottomControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    zIndex: 100,
    gap: 16,
  },

  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  actionButtonText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },

  zoomIndicator: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  zoomText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
