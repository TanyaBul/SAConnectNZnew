import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";

import DiscoverStackNavigator from "@/navigation/DiscoverStackNavigator";
import MessagesStackNavigator from "@/navigation/MessagesStackNavigator";
import EventsStackNavigator from "@/navigation/EventsStackNavigator";
import BusinessStackNavigator from "@/navigation/BusinessStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { WelcomeCards } from "@/components/WelcomeCards";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useTabBadges } from "@/hooks/useTabBadges";

export type MainTabParamList = {
  DiscoverTab: undefined;
  MessagesTab: undefined;
  EventsTab: undefined;
  BusinessTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIconWithBadge({ name, color, size, showBadge }: { name: keyof typeof Feather.glyphMap; color: string; size: number; showBadge: boolean }) {
  return (
    <View>
      <Feather name={name} size={size} color={color} />
      {showBadge ? (
        <View style={styles.badge} />
      ) : null}
    </View>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { user, showWelcomeCards, dismissWelcomeCards } = useAuth();
  const {
    hasUnreadMessages,
    hasNewEvents,
    hasNewBusinesses,
    hasPendingRequests,
    markEventsSeen,
    markBusinessesSeen,
    markMessagesSeen,
    markRequestsSeen,
  } = useTabBadges(user?.id);

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      initialRouteName="DiscoverTab"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverStackNavigator}
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <TabIconWithBadge name="compass" color={color} size={size} showBadge={hasPendingRequests} />
          ),
        }}
        listeners={{
          tabPress: () => {
            markRequestsSeen();
          },
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStackNavigator}
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <TabIconWithBadge name="message-circle" color={color} size={size} showBadge={hasUnreadMessages} />
          ),
        }}
        listeners={{
          tabPress: () => {
            markMessagesSeen();
          },
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStackNavigator}
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <TabIconWithBadge name="calendar" color={color} size={size} showBadge={hasNewEvents} />
          ),
        }}
        listeners={{
          tabPress: () => {
            markEventsSeen();
          },
        }}
      />
      <Tab.Screen
        name="BusinessTab"
        component={BusinessStackNavigator}
        options={{
          title: "Business",
          tabBarIcon: ({ color, size }) => (
            <TabIconWithBadge name="briefcase" color={color} size={size} showBadge={hasNewBusinesses} />
          ),
        }}
        listeners={{
          tabPress: () => {
            markBusinessesSeen();
          },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <TabIconWithBadge name="user" color={color} size={size} showBadge={false} />
          ),
        }}
      />
    </Tab.Navigator>
    {showWelcomeCards ? (
      <WelcomeCards onComplete={dismissWelcomeCards} />
    ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#16A34A",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
