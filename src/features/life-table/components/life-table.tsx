import React, { RefObject, useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import { useLifeTableCache } from "../hooks/use-life-table-cache";
import { useLifeTableData } from "../hooks/use-life-table-data";
import type { LifeTableProps } from "../types";
import { CachedImage } from "./cached-image";
import { LifeTableCanvas } from "./life-table-canvas";

import { LifeTableSkeleton } from "./life-table-skeleton";
import { styles } from "./life-table.styles";

export const LifeTable: React.FC<LifeTableProps> = ({ user }) => {
  const viewShotRef = useRef<ViewShot>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const scale = useSharedValue(0.5);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const tableData = useLifeTableData(user);

  const {
    cachedImageUri,
    isCacheLoading,
    isReadyToCapture,
    invalidateCacheAndRecapture,
  } = useLifeTableCache(user, tableData, viewShotRef as RefObject<ViewShot>);

  useEffect(() => {
    invalidateCacheAndRecapture();
  }, [user]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(3, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  if (isCacheLoading) {
    return <LifeTableSkeleton totalRows={tableData.totalRows} />;
  }

  if (!cachedImageUri && isReadyToCapture) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.captureContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{
              format: "png",
              quality: 1,
              width: tableData.fullWidth,
              height: tableData.fullHeight,
            }}
            style={{
              width: tableData.fullWidth,
              height: tableData.fullHeight,
            }}
          >
            <LifeTableCanvas user={user} tableData={tableData} />
          </ViewShot>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {cachedImageUri && !isReadyToCapture && (
        <>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <GestureDetector gesture={composedGesture}>
              <Animated.View style={animatedStyle}>
                <CachedImage
                  uri={cachedImageUri}
                  width={tableData.fullWidth}
                  height={tableData.fullHeight}
                />
              </Animated.View>
            </GestureDetector>
          </ScrollView>

          {/* {__DEV__ && (
            <View style={styles.refreshButtonContainer}>
              <Button
                title="Refresh Canvas"
                onPress={invalidateCacheAndRecapture}
              />
            </View>
          )} */}
        </>
      )}

      {isReadyToCapture && (
        <View style={styles.captureContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{
              format: "png",
              quality: 1,
              width: tableData.fullWidth,
              height: tableData.fullHeight,
            }}
            style={{
              width: tableData.fullWidth,
              height: tableData.fullHeight,
            }}
          >
            <LifeTableCanvas user={user} tableData={tableData} />
          </ViewShot>
        </View>
      )}
    </GestureHandlerRootView>
  );
};
