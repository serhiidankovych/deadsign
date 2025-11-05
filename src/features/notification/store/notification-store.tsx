import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface NotificationSettings {
  enabled: boolean;
  pushToken?: string;
  dailyReminderEnabled: boolean;
  dailyReminderTime: {
    hour: number;
    minute: number;
  };
}

interface NotificationStore {
  settings: NotificationSettings;
  setEnabled: (enabled: boolean) => void;
  setPushToken: (token?: string) => void;
  setDailyReminder: (enabled: boolean, hour?: number, minute?: number) => void;
  resetSettings: () => void;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  pushToken: undefined,
  dailyReminderEnabled: false,
  dailyReminderTime: {
    hour: 9,
    minute: 0,
  },
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

      setDailyReminder: (enabled, hour, minute) =>
        set((state) => ({
          settings: {
            ...state.settings,
            dailyReminderEnabled: enabled,
            dailyReminderTime: {
              hour: hour ?? state.settings.dailyReminderTime.hour,
              minute: minute ?? state.settings.dailyReminderTime.minute,
            },
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
