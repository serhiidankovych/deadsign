import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useReducer } from "react";

const ONBOARDING_STORAGE_KEY = "temp_onboarding_data";

interface OnboardingData {
  dateOfBirth?: Date;
  country?: string;
  lifeExpectancy?: number;
  name?: string;
}

interface OnboardingState {
  onboardingData: OnboardingData;
  isLoading: boolean;
}

type OnboardingAction =
  | { type: "UPDATE_DATA"; payload: Partial<OnboardingData> }
  | { type: "SET_DATA"; payload: OnboardingData }
  | { type: "CLEAR_DATA" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: OnboardingState = {
  onboardingData: {},
  isLoading: true,
};

const onboardingReducer = (
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState => {
  switch (action.type) {
    case "UPDATE_DATA":
      return {
        ...state,
        onboardingData: { ...state.onboardingData, ...action.payload },
      };
    case "SET_DATA":
      return {
        ...state,
        onboardingData: action.payload,
      };
    case "CLEAR_DATA":
      return { ...initialState, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const OnboardingContext = createContext<{
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
} | null>(null);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);

          if (parsedData.dateOfBirth) {
            parsedData.dateOfBirth = new Date(parsedData.dateOfBirth);
          }
          dispatch({ type: "SET_DATA", payload: parsedData });
        }
      } catch (e) {
        console.error("Failed to load onboarding data", e);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(
            ONBOARDING_STORAGE_KEY,
            JSON.stringify(state.onboardingData)
          );
        } catch (e) {
          console.error("Failed to save onboarding data", e);
        }
      };
      saveData();
    }
  }, [state.onboardingData, state.isLoading]);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingStore = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error(
      "useOnboardingStore must be used within OnboardingProvider"
    );
  }

  const { state, dispatch } = context;

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    dispatch({ type: "UPDATE_DATA", payload: data });
  };

  const clearOnboardingData = async () => {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
    dispatch({ type: "CLEAR_DATA" });
  };

  return {
    onboardingData: state.onboardingData,
    isLoading: state.isLoading,
    updateOnboardingData,
    clearOnboardingData,
  };
};
