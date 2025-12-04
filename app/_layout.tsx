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

const queryClient = new QueryClient();

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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="light" backgroundColor={Colors.background} />

      {isGlobalLoading && <GlobalLoadingOverlay visible={isGlobalLoading} />}
    </View>
  );
}

export default function RootLayout() {
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
