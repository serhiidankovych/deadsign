import { Colors } from "@/src/constants/colors";
import { NotificationProvider } from "@/src/features/notification/store/notification-provider";
import { OnboardingProvider } from "@/src/features/onboarding/store/onboarding-store";
import { UserProvider } from "@/src/store/user-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider>
        <UserProvider>
          <NotificationProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>

            <StatusBar style="light" backgroundColor={Colors.background} />
          </NotificationProvider>
        </UserProvider>
      </OnboardingProvider>
    </QueryClientProvider>
  );
}
