import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type NotificationContent =
  | "weeksLived"
  | "weeksRemaining"
  | "ageProgress"
  | "motivation"
  | null;

export interface CustomNotification {
  id: string;
  title: string;
  bodyText: string;
  enabled: boolean;
  time: {
    hour: number;
    minute: number;
  };
  selectedContent: NotificationContent;
  daysOfWeek: DayOfWeek[];
}

export interface NotificationSettings {
  enabled: boolean;
  pushToken?: string;
  customNotifications: CustomNotification[];
  permissionStatus?: "granted" | "denied" | "undetermined";
}

interface NotificationStore {
  settings: NotificationSettings;
  setEnabled: (enabled: boolean) => Promise<boolean>;
  setPushToken: (token?: string) => void;
  addCustomNotification: (notification: Omit<CustomNotification, "id">) => void;
  updateCustomNotification: (
    id: string,
    notification: Partial<CustomNotification>,
  ) => void;
  deleteCustomNotification: (id: string) => void;
  resetSettings: () => Promise<void>;
  checkPermissionStatus: () => Promise<void>;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  pushToken: undefined,
  customNotifications: [],
  permissionStatus: "undetermined",
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      setEnabled: async (enabled) => {
        if (enabled) {
          const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

          let finalStatus = existingStatus;

          if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== "granted") {
            set((state) => ({
              settings: {
                ...state.settings,
                enabled: false,
                permissionStatus: "denied",
              },
            }));
            return false;
          }

          set((state) => ({
            settings: {
              ...state.settings,
              enabled: true,
              permissionStatus: "granted",
            },
          }));
          return true;
        } else {
          set((state) => ({
            settings: { ...state.settings, enabled: false },
          }));
          return true;
        }
      },

      setPushToken: (token) =>
        set((state) => ({
          settings: { ...state.settings, pushToken: token },
        })),

      addCustomNotification: (notification) =>
        set((state) => ({
          settings: {
            ...state.settings,
            customNotifications: [
              ...(state.settings.customNotifications || []),
              {
                ...notification,
                id: `custom_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
              },
            ],
          },
        })),

      updateCustomNotification: (id, updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            customNotifications: (state.settings.customNotifications || []).map(
              (notif) => (notif.id === id ? { ...notif, ...updates } : notif),
            ),
          },
        })),

      deleteCustomNotification: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            customNotifications: (
              state.settings.customNotifications || []
            ).filter((notif) => notif.id !== id),
          },
        })),

      resetSettings: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        set({ settings: defaultSettings });
      },

      checkPermissionStatus: async () => {
        const { status } = await Notifications.getPermissionsAsync();
        set((state) => ({
          settings: {
            ...state.settings,
            permissionStatus: status,

            enabled: status === "granted" ? state.settings.enabled : false,
          },
        }));
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...(persistedState as object),
        settings: {
          ...currentState.settings,
          ...(persistedState?.settings as object),
          customNotifications:
            persistedState?.settings?.customNotifications || [],
        },
      }),
    },
  ),
);
