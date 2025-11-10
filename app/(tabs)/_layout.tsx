import { AuthGuard } from "@/src/components/auth-guard";
import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <AuthGuard requireAuth={true}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.tabBarActive,
          tabBarInactiveTintColor: Colors.tabBarInactive,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.tabBarBackground,
            borderTopColor: Colors.tabBarBorder,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Life Table",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
