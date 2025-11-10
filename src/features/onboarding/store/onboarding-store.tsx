import React, { createContext, useContext, useReducer } from "react";

interface OnboardingData {
  dateOfBirth?: Date;
  country?: string;
  lifeExpectancy?: number;
  name?: string;
}

interface OnboardingState {
  onboardingData: OnboardingData;
}

type OnboardingAction =
  | { type: "UPDATE_DATA"; payload: Partial<OnboardingData> }
  | { type: "CLEAR_DATA" };

const initialState: OnboardingState = {
  onboardingData: {},
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
    case "CLEAR_DATA":
      return initialState;
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

  const clearOnboardingData = () => {
    dispatch({ type: "CLEAR_DATA" });
  };

  return {
    onboardingData: state.onboardingData,
    updateOnboardingData,
    clearOnboardingData,
  };
};
