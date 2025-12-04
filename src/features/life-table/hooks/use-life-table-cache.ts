import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import { RefObject, useEffect, useState } from "react";
import ViewShot from "react-native-view-shot";
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
  viewShotRef: RefObject<ViewShot>
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

  const captureAndSaveImage = async () => {
    if (viewShotRef.current?.capture) {
      try {
        const localUri = await viewShotRef.current.capture();
        if (!localUri) {
          throw new Error("Capture failed to produce a URI.");
        }

        const tempFile = new File(localUri);
        if (await CACHE_FILE.exists) {
          await CACHE_FILE.delete();
        }
        await tempFile.move(CACHE_FILE);

        await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

        setCachedImageUri(`${CACHE_FILE.uri}?t=${Date.now()}`);
        setIsReadyToCapture(false);
      } catch (error) {
        console.error("Failed to capture and save image:", error);
        setIsReadyToCapture(false);
      }
    }
  };

  useEffect(() => {
    if (isReadyToCapture) {
      requestAnimationFrame(() => {
        captureAndSaveImage();
      });
    }
  }, [isReadyToCapture]);

  const invalidateCacheAndRecapture = async () => {
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
  };

  return {
    cachedImageUri,
    isCacheLoading,
    isReadyToCapture,
    captureAndSaveImage,
    invalidateCacheAndRecapture,
  };
};
