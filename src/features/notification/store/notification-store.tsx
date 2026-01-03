import AsyncStorage from "@react-native-async-storage/async-storage";
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
}

interface NotificationStore {
  settings: NotificationSettings;
  setEnabled: (enabled: boolean) => void;
  setPushToken: (token?: string) => void;
  addCustomNotification: (notification: Omit<CustomNotification, "id">) => void;
  updateCustomNotification: (
    id: string,
    notification: Partial<CustomNotification>
  ) => void;
  deleteCustomNotification: (id: string) => void;
  resetSettings: () => void;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  pushToken: undefined,
  customNotifications: [],
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setEnabled: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, enabled },
        })),
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
              (notif) => (notif.id === id ? { ...notif, ...updates } : notif)
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
      resetSettings: () => set({ settings: defaultSettings }),
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
    }
  )
);
