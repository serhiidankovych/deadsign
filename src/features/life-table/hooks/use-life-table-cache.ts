import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import { RefObject, useCallback, useEffect, useState } from "react";
import type { LifeTableCanvasRef } from "../components/life-table-canvas";
import type { TableData, User } from "../types";
import { isNewDay } from "../utils/date-utils";

const CACHE_FILE = new File(Paths.document, "life_table_cache.png");
const CACHE_TIMESTAMP_KEY = "life_table_cache_timestamp";

interface UseLifeTableCacheReturn {
  cachedImageUri: string | null;
  isCacheLoading: boolean;
  isReadyToCapture: boolean;
  captureAndSaveImage: () => Promise<void>;
  invalidateCacheAndRecapture: () => Promise<void>;
}

export const useLifeTableCache = (
  user: User,
  tableData: TableData,
  canvasRef: RefObject<LifeTableCanvasRef>,
): UseLifeTableCacheReturn => {
  const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
  const [isCacheLoading, setIsCacheLoading] = useState(true);
  const [isReadyToCapture, setIsReadyToCapture] = useState(false);

  useEffect(() => {
    const loadImageOrPrepareCapture = async () => {
      try {
        const timestampStr = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (
          timestampStr &&
          (await CACHE_FILE.exists) &&
          !isNewDay(parseInt(timestampStr, 10), Date.now())
        ) {
          setCachedImageUri(`${CACHE_FILE.uri}?t=${Date.now()}`);
          setIsReadyToCapture(false);
        } else {
          setIsReadyToCapture(true);
        }
      } catch (error) {
        console.error("Failed to load cached image:", error);
        setIsReadyToCapture(true);
      } finally {
        setIsCacheLoading(false);
      }
    };

    loadImageOrPrepareCapture();
  }, [user.totalWeeks, user.weeksLived]);

  const captureAndSaveImage = useCallback(async () => {
    if (!canvasRef.current?.makeImage) {
      console.error("Canvas ref not available for capture");
      return;
    }

    try {
      const base64 = await canvasRef.current.makeImage();
      if (!base64) {
        throw new Error("Capture failed to produce base64.");
      }

      const data = base64.replace(/^data:image\/png;base64,/, "");

      if (await CACHE_FILE.exists) {
        await CACHE_FILE.delete();
      }

      await CACHE_FILE.write(data, { encoding: "base64" });

      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

      setCachedImageUri(`${CACHE_FILE.uri}?t=${Date.now()}`);
      setIsReadyToCapture(false);

      console.log("✅ Image cached successfully");
    } catch (error) {
      console.error("Failed to capture and save image:", error);
      setIsReadyToCapture(false);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (isReadyToCapture) {
      requestAnimationFrame(() => {
        captureAndSaveImage();
      });
    }
  }, [isReadyToCapture, captureAndSaveImage]);

  const invalidateCacheAndRecapture = useCallback(async () => {
    console.log("Forcing cache invalidation and recapture...");
    try {
      if (await CACHE_FILE.exists) {
        await CACHE_FILE.delete();
      }
      await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
      setCachedImageUri(null);
      setIsReadyToCapture(true);
    } catch (error) {
      console.error("Failed to invalidate cache:", error);
    }
  }, []);

  return {
    cachedImageUri,
    isCacheLoading,
    isReadyToCapture,
    captureAndSaveImage,
    invalidateCacheAndRecapture,
  };
};
