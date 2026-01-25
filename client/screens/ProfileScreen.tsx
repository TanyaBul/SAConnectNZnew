import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { InterestTag } from "@/components/InterestTag";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Please sign in</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={styles.header}>
          <Avatar uri={user.avatarUrl} size="xlarge" showEditBadge onPress={() => {}} />
          <ThemedText type="h3" style={styles.familyName}>
            {user.familyName}
          </ThemedText>
          {user.location ? (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText
                type="body"
                style={[styles.locationText, { color: theme.textSecondary }]}
              >
                {user.location.suburb}, {user.location.city}
              </ThemedText>
            </View>
          ) : (
            <Pressable
              style={[styles.addLocationButton, { borderColor: theme.border }]}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Feather name="map-pin" size={16} color={theme.primary} />
              <ThemedText type="caption" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
                Add your location
              </ThemedText>
            </Pressable>
          )}
        </View>

        {user.bio ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              About
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {user.bio}
            </ThemedText>
          </View>
        ) : (
          <Pressable
            style={[styles.addSection, { borderColor: theme.border }]}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Feather name="edit-2" size={20} color={theme.primary} />
            <ThemedText type="body" style={{ color: theme.primary, marginLeft: Spacing.sm }}>
              Add a bio about your family
            </ThemedText>
          </Pressable>
        )}

        {user.kids.length > 0 ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Kids
            </ThemedText>
            <View style={styles.kidsGrid}>
              {user.kids.map((kid) => (
                <View
                  key={kid.id}
                  style={[styles.kidCard, { backgroundColor: theme.backgroundSecondary }]}
                >
                  <Feather name="user" size={20} color={theme.primary} />
                  <View style={styles.kidInfo}>
                    <ThemedText type="body" style={{ fontWeight: "500" }}>
                      {kid.name}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {kid.age} years old
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {user.interests.length > 0 ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Interests
            </ThemedText>
            <View style={styles.interestsGrid}>
              {user.interests.map((interest) => (
                <InterestTag key={interest} label={interest} />
              ))}
            </View>
          </View>
        ) : null}

        <Button
          onPress={() => navigation.navigate("EditProfile")}
          variant="outline"
          style={styles.editButton}
        >
          Edit Profile
        </Button>

        <Button
          onPress={() => navigation.navigate("Settings")}
          variant="ghost"
          style={styles.settingsButton}
        >
          Settings
        </Button>
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
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  familyName: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  locationText: {
    marginLeft: Spacing.xs,
  },
  addLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  addSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  kidsGrid: {
    gap: Spacing.sm,
  },
  kidCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  kidInfo: {
    marginLeft: Spacing.md,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  editButton: {
    marginTop: Spacing.lg,
  },
  settingsButton: {
    marginTop: Spacing.sm,
  },
});
