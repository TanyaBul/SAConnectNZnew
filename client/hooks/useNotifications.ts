import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
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
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === "web") {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "sa-connect-nz",
  });

  return tokenData.data;
}

export function useNotifications(userId?: string) {
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    registerForPushNotifications().then(async (token) => {
      if (token) {
        tokenRef.current = token;
        try {
          await apiRequest("POST", "/api/push-token", { userId, token });
        } catch (error) {
          console.log("Could not register push token:", error);
        }
      }
    });
  }, [userId]);

  return { token: tokenRef.current };
}
