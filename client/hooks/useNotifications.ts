import { useEffect, useRef } from "react";
import { Platform, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { apiRequest } from "@/lib/query-client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log("No EAS project ID found, trying with slug fallback");
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });

    console.log("Push token obtained:", tokenData.data.substring(0, 30) + "...");
    return tokenData.data;
  } catch (error) {
    console.error("Failed to get push token:", error);
    return null;
  }
}

export function useNotifications(userId?: string) {
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    registerForPushNotifications().then(async (token) => {
      if (token) {
        tokenRef.current = token;
        try {
          const response = await apiRequest("POST", "/api/push-token", { userId, token });
          console.log("Push token registered successfully");
        } catch (error) {
          console.log("Could not register push token:", error);
        }
      }
    });
  }, [userId]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    Notifications.setBadgeCountAsync(0).catch(() => {});

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        Notifications.setBadgeCountAsync(0).catch(() => {});
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userId]);

  return { token: tokenRef.current };
}
