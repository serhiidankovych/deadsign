import { GlobalLoadingOverlay } from "@/src/components/global-loading-overlay";
import { Colors } from "@/src/constants/colors";
import { NotificationProvider } from "@/src/features/notification/store/notification-provider";
import { OnboardingProvider } from "@/src/features/onboarding/store/onboarding-store";
import { useLoadingStore } from "@/src/store/loading-store";
import { UserProvider } from "@/src/store/user-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import {
  ArchitectsDaughter_400Regular,
  useFonts,
} from "@expo-google-fonts/architects-daughter";

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

function LayoutContent() {
  const { isGlobalLoading } = useLoadingStore();

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>

      <StatusBar style="light" backgroundColor={Colors.background} />

      {isGlobalLoading && <GlobalLoadingOverlay visible />}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ArchitectsDaughter_400Regular,

    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider>
        <UserProvider>
          <NotificationProvider>
            <LayoutContent />
          </NotificationProvider>
        </UserProvider>
      </OnboardingProvider>
    </QueryClientProvider>
  );
}
