import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
}

type UserAction =
  | { type: "SET_USER"; payload: User }
  | { type: "CLEAR_USER" }
  | { type: "SET_ONBOARDED"; payload: boolean };

const initialState: UserState = {
  user: null,
  isOnboarded: false,
};

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isOnboarded: true };
    case "CLEAR_USER":
      return initialState;
    case "SET_ONBOARDED":
      return { ...state, isOnboarded: action.payload };
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

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (state.user) {
      saveUserData();
    }
  }, [state.user]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        user.dateOfBirth = new Date(user.dateOfBirth);
        dispatch({ type: "SET_USER", payload: user });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem("user_data", JSON.stringify(state.user));
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

  const setUser = (
    userData: Omit<User, "currentAge" | "weeksLived" | "totalWeeks">
  ) => {
    const now = new Date();
    const currentAge = Math.floor(
      (now.getTime() - userData.dateOfBirth.getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
    );
    const weeksLived = Math.floor(
      (now.getTime() - userData.dateOfBirth.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    const totalWeeks = userData.lifeExpectancy * 52;

    const user: User = {
      ...userData,
      currentAge,
      weeksLived,
      totalWeeks,
    };

    dispatch({ type: "SET_USER", payload: user });
  };

  const clearUser = () => {
    AsyncStorage.removeItem("user_data");
    dispatch({ type: "CLEAR_USER" });
  };

  return {
    user: state.user,
    isOnboarded: state.isOnboarded,
    setUser,
    clearUser,
  };
};
