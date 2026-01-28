import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { AppState } from "react-native";
import { clearOnboardingDataDirectly } from "../features/onboarding/store/onboarding-store";

interface User {
  name: string;
  dateOfBirth: Date;
  country: string;
  lifeExpectancy: number;
  currentAge: number;
  weeksLived: number;
  totalWeeks: number;
}

interface UserState {
  user: User | null;
  isOnboarded: boolean;
  isLoading: boolean;
}

type UserAction =
  | { type: "SET_USER"; payload: User }
  | { type: "CLEAR_USER" }
  | { type: "SET_ONBOARDED"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: UserState = {
  user: null,
  isOnboarded: false,
  isLoading: true,
};

const CACHE_TIMESTAMP_KEY = "life_table_cache_timestamp";

const isNewDay = (timestamp1: number, timestamp2: number) => {
  const date1 = new Date(timestamp1).toDateString();
  const date2 = new Date(timestamp2).toDateString();
  return date1 !== date2;
};

const recalculateLiveUserData = (user: User): User => {
  const now = new Date();
  const dob = new Date(user.dateOfBirth);

  const currentAge = Math.floor(
    (now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  const weeksLived = Math.floor(
    (now.getTime() - dob.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

  return { ...user, currentAge, weeksLived };
};

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isOnboarded: true,
        isLoading: false,
      };
    case "CLEAR_USER":
      return { ...initialState, isLoading: false };
    case "SET_ONBOARDED":
      return { ...state, isOnboarded: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
} | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const isInitialMount = useRef(true);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (state.user && !state.isLoading) {
      saveUserData();
    }
  }, [state.user]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState !== "active" || !state.user) {
        return;
      }

      try {
        const now = Date.now();
        const timestampStr = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
        const lastUpdateTimestamp = timestampStr
          ? parseInt(timestampStr, 10)
          : 0;

        if (isNewDay(lastUpdateTimestamp, now)) {
          const updatedUser = recalculateLiveUserData(state.user);
          await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
          dispatch({ type: "SET_USER", payload: updatedUser });
        }
      } catch (error) {
        console.error("Failed to check for daily update:", error);
      }
    };

    if (state.user) {
      handleAppStateChange("active");
    }

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [state.user]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        user.dateOfBirth = new Date(user.dateOfBirth);
        const freshUser = recalculateLiveUserData(user);
        dispatch({ type: "SET_USER", payload: freshUser });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const saveUserData = async () => {
    try {
      if (state.user) {
        await AsyncStorage.setItem("user_data", JSON.stringify(state.user));
      }
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserStore must be used within UserProvider");
  }

  const { state, dispatch } = context;

  const setUser = useCallback(
    async (
      userData: Omit<User, "currentAge" | "weeksLived" | "totalWeeks">,
    ) => {
      const prevUser = state.user;

      const prevDob = prevUser ? new Date(prevUser.dateOfBirth).getTime() : 0;
      const newDob = new Date(userData.dateOfBirth).getTime();

      const hasVisualChanges =
        !prevUser ||
        prevUser.lifeExpectancy !== userData.lifeExpectancy ||
        prevDob !== newDob;

      if (hasVisualChanges) {
        const CACHE_FILE = new File(Paths.document, "life_table_cache.png");
        try {
          if (await CACHE_FILE.exists) {
            await CACHE_FILE.delete();
          }
          await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
        } catch (error) {
          console.error(
            "Error clearing LifeTable cache on user update:",
            error,
          );
        }
      }

      const totalWeeks = userData.lifeExpectancy * 52;
      const user = recalculateLiveUserData({
        ...userData,
        currentAge: 0,
        weeksLived: 0,
        totalWeeks,
      });

      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      dispatch({ type: "SET_USER", payload: user });
    },
    [state.user, dispatch],
  );

  const refreshUser = useCallback(() => {
    if (state.user) {
      const updatedUser = recalculateLiveUserData(state.user);
      dispatch({ type: "SET_USER", payload: updatedUser });
    }
  }, [state.user, dispatch]);

  const clearUser = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("user_data");

      const CACHE_FILE = new File(Paths.document, "life_table_cache.png");
      if (await CACHE_FILE.exists) {
        await CACHE_FILE.delete();
      }
      await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);

      const { useNotificationStore } =
        await import("@/src/features/notification/store/notification-store");
      const { resetSettings } = useNotificationStore.getState();
      await resetSettings();

      await clearOnboardingDataDirectly();

      dispatch({ type: "CLEAR_USER" });
      console.log("✅ All data cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing user data:", error);
      dispatch({ type: "CLEAR_USER" });
    }
  }, [dispatch]);

  return useMemo(
    () => ({
      user: state.user,
      isOnboarded: state.isOnboarded,
      isLoading: state.isLoading,
      setUser,
      clearUser,
      refreshUser,
    }),
    [
      state.user,
      state.isOnboarded,
      state.isLoading,
      setUser,
      clearUser,
      refreshUser,
    ],
  );
};
export const getYearLabel = (years: number): string => {
  return years === 1 ? "year" : "years";
};
