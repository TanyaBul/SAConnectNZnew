import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { signOut, user } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await signOut();
          },
        },
      ]
    );
  };

  const toggleNotifications = (value: boolean) => {
    Haptics.selectionAsync();
    setNotifications(value);
  };

  const toggleLocationSharing = (value: boolean) => {
    Haptics.selectionAsync();
    setLocationSharing(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            Account
          </ThemedText>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="mail" size={20} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.rowLabel}>
                Email
              </ThemedText>
            </View>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {user?.email}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            Preferences
          </ThemedText>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="bell" size={20} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.rowLabel}>
                Notifications
              </ThemedText>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="map-pin" size={20} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.rowLabel}>
                Location Sharing
              </ThemedText>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={toggleLocationSharing}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            Support
          </ThemedText>
          <Pressable style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="help-circle" size={20} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.rowLabel}>
                Help & FAQ
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="file-text" size={20} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.rowLabel}>
                Privacy Policy
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="book" size={20} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.rowLabel}>
                Terms of Service
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable style={styles.row} onPress={handleLogout}>
            <View style={styles.rowLeft}>
              <Feather name="log-out" size={20} color={theme.error} />
              <ThemedText type="body" style={[styles.rowLabel, { color: theme.error }]}>
                Sign Out
              </ThemedText>
            </View>
          </Pressable>
        </View>

        <ThemedText type="small" style={[styles.version, { color: theme.textSecondary }]}>
          SA Connect NZ v1.0.0
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowLabel: {
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.lg + 20 + Spacing.md,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
