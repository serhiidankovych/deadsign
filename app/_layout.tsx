import { NotificationProvider } from "@/src/features/notification/store/notification-provider";
import { OnboardingProvider } from "@/src/store/onboarding-store";
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
                contentStyle: { backgroundColor: "#0E0D0D" },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
            <StatusBar style="light" backgroundColor="#0E0D0D" />
          </NotificationProvider>
        </UserProvider>
      </OnboardingProvider>
    </QueryClientProvider>
  );
}
