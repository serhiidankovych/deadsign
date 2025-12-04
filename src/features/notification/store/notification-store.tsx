import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type NotificationType = "stats" | "motivation" | "both";

export interface NotificationSettings {
  enabled: boolean;
  pushToken?: string;

  statsReminderEnabled: boolean;
  statsReminderTime: {
    hour: number;
    minute: number;
  };

  motivationReminderEnabled: boolean;
  motivationReminderTime: {
    hour: number;
    minute: number;
  };

  includeWeeksLived: boolean;
  includeAgeProgress: boolean;
}

interface NotificationStore {
  settings: NotificationSettings;
  setEnabled: (enabled: boolean) => void;
  setPushToken: (token?: string) => void;
  setStatsReminder: (enabled: boolean, hour?: number, minute?: number) => void;
  setMotivationReminder: (
    enabled: boolean,
    hour?: number,
    minute?: number
  ) => void;
  setStatsPreferences: (weeksLived: boolean, ageProgress: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  pushToken: undefined,
  statsReminderEnabled: false,
  statsReminderTime: {
    hour: 9,
    minute: 0,
  },
  motivationReminderEnabled: false,
  motivationReminderTime: {
    hour: 20,
    minute: 0,
  },
  includeWeeksLived: true,
  includeAgeProgress: true,
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setEnabled: (enabled) =>
        set((state) => ({
          settings: {
            ...state.settings,
            enabled,
          },
        })),
      setPushToken: (token) =>
        set((state) => ({
          settings: {
            ...state.settings,
            pushToken: token,
          },
        })),
      setStatsReminder: (enabled, hour, minute) =>
        set((state) => ({
          settings: {
            ...state.settings,
            statsReminderEnabled: enabled,
            statsReminderTime: {
              hour:
                hour ??
                state.settings.statsReminderTime?.hour ??
                defaultSettings.statsReminderTime.hour,
              minute:
                minute ??
                state.settings.statsReminderTime?.minute ??
                defaultSettings.statsReminderTime.minute,
            },
          },
        })),
      setMotivationReminder: (enabled, hour, minute) =>
        set((state) => ({
          settings: {
            ...state.settings,
            motivationReminderEnabled: enabled,
            motivationReminderTime: {
              hour:
                hour ??
                state.settings.motivationReminderTime?.hour ??
                defaultSettings.motivationReminderTime.hour,
              minute:
                minute ??
                state.settings.motivationReminderTime?.minute ??
                defaultSettings.motivationReminderTime.minute,
            },
          },
        })),
      setStatsPreferences: (weeksLived, ageProgress) =>
        set((state) => ({
          settings: {
            ...state.settings,
            includeWeeksLived: weeksLived,
            includeAgeProgress: ageProgress,
          },
        })),
      resetSettings: () =>
        set({
          settings: defaultSettings,
        }),
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
