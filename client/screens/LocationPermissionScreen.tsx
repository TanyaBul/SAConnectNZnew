import React, { useState } from "react";
import { View, StyleSheet, Platform, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function LocationPermissionScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateProfile, completeOnboarding } = useAuth();
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleEnableLocation = async () => {
    setLoading(true);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        await updateProfile({
          location: {
            suburb: address?.subregion || address?.district || "Unknown",
            city: address?.city || "Unknown",
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            radiusPreference: 25,
          },
        });
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await completeOnboarding();
      } else if (!canAskAgain) {
        setPermissionDenied(true);
      }
    } catch (error) {
      console.error("Location error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSettings = async () => {
    if (Platform.OS !== "web") {
      try {
        await Linking.openSettings();
      } catch (error) {
        console.error("Could not open settings:", error);
      }
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + Spacing["5xl"] },
        ]}
      >
        <Image
          source={require("../../assets/images/location-permission.png")}
          style={styles.image}
          contentFit="contain"
        />
        
        <ThemedText type="h3" style={styles.title}>
          Find Families Near You
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.description, { color: theme.textSecondary }]}
        >
          Enable location to discover South African families in your area. We only use your location to show nearby families.
        </ThemedText>

        {permissionDenied ? (
          <View style={[styles.deniedBox, { backgroundColor: theme.accent + "15" }]}>
            <ThemedText type="caption" style={{ color: theme.text }}>
              Location access was denied. You can enable it in your device settings to discover nearby families.
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        {permissionDenied && Platform.OS !== "web" ? (
          <Button
            onPress={handleOpenSettings}
            style={styles.primaryButton}
            size="large"
          >
            Open Settings
          </Button>
        ) : (
          <Button
            onPress={handleEnableLocation}
            loading={loading}
            style={styles.primaryButton}
            size="large"
          >
            Enable Location
          </Button>
        )}
        <Button onPress={handleSkip} variant="ghost">
          Maybe Later
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  image: {
    width: 280,
    height: 220,
    marginBottom: Spacing["3xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  deniedBox: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  primaryButton: {
    marginBottom: Spacing.md,
  },
});
