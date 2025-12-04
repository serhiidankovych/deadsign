import { Loading } from "@/src/components/ui/loading";
import { Colors } from "@/src/constants/colors";
import { useOnboardingStore } from "@/src/features/onboarding/store/onboarding-store";
import { useUserStore } from "@/src/store/user-store";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function Index() {
  const { isOnboarded, isLoading: isUserLoading } = useUserStore();
  const { onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !isOnboardingLoading) {
      setIsReady(true);
    }
  }, [isUserLoading, isOnboardingLoading]);

  const getResumeRoute = () => {
    if (!onboardingData.dateOfBirth) {
      return "/onboarding";
    }

    if (!onboardingData.lifeExpectancy) {
      return "/onboarding/life-expectancy";
    }

    if (!onboardingData.name) {
      return "/onboarding/result";
    }

    return "/onboarding/final";
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    );
  }

  if (isOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href={getResumeRoute()} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
