import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { InterestTag } from "@/components/InterestTag";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface FamilyMember {
  id: string;
  name: string;
  age: number;
}

interface FamilyCardProps {
  id: string;
  familyName: string;
  bio: string;
  avatarUrl: string | null;
  distance: number;
  interests: string[];
  familyMembers: FamilyMember[];
  onPress: () => void;
  onConnect: () => void;
  isConnected?: boolean;
  isPending?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FamilyCard({
  familyName,
  bio,
  avatarUrl,
  distance,
  interests = [],
  familyMembers = [],
  onPress,
  onConnect,
  isConnected = false,
  isPending = false,
}: FamilyCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConnect();
  };

  const displayInterests = (interests || []).slice(0, 3);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          ...Shadows.card,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <Avatar uri={avatarUrl} size="medium" />
        <View style={styles.headerInfo}>
          <ThemedText type="heading" numberOfLines={1}>
            {familyName}
          </ThemedText>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={14} color={theme.textSecondary} />
            <ThemedText
              type="caption"
              style={[styles.metaText, { color: theme.textSecondary }]}
            >
              {distance < 1 ? "< 1 km away" : `${distance} km away`}
            </ThemedText>
            {familyMembers.length > 0 ? (
              <>
                <View style={[styles.dot, { backgroundColor: theme.border }]} />
                <Feather name="users" size={14} color={theme.textSecondary} />
                <ThemedText
                  type="caption"
                  style={[styles.metaText, { color: theme.textSecondary }]}
                >
                  {familyMembers.length} {familyMembers.length === 1 ? "member" : "members"}
                </ThemedText>
              </>
            ) : null}
          </View>
        </View>
      </View>

      {bio ? (
        <ThemedText
          type="body"
          numberOfLines={2}
          style={[styles.bio, { color: theme.textSecondary }]}
        >
          {bio}
        </ThemedText>
      ) : null}

      {familyMembers.length > 0 ? (
        <View style={styles.familyMembersRow}>
          <Feather name="users" size={14} color={theme.secondary} />
          <ThemedText
            type="caption"
            style={[styles.familyMembersText, { color: theme.text }]}
            numberOfLines={1}
          >
            {familyMembers.map((m) => `${m.name}${m.age > 0 ? ` (${m.age})` : ""}`).join(", ")}
          </ThemedText>
        </View>
      ) : null}

      {displayInterests.length > 0 ? (
        <View style={styles.interests}>
          {displayInterests.map((interest) => (
            <InterestTag key={interest} label={interest} size="small" />
          ))}
          {interests.length > 3 ? (
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary }}
            >
              +{interests.length - 3} more
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      <View style={styles.footer}>
        {isConnected ? (
          <View
            style={[
              styles.connectedBadge,
              { backgroundColor: theme.success + "20" },
            ]}
          >
            <Feather name="check-circle" size={16} color={theme.success} />
            <ThemedText
              type="caption"
              style={[styles.connectedText, { color: theme.success }]}
            >
              Connected
            </ThemedText>
          </View>
        ) : isPending ? (
          <View
            style={[
              styles.connectedBadge,
              { backgroundColor: theme.accent + "20" },
            ]}
          >
            <Feather name="clock" size={16} color={theme.accent} />
            <ThemedText
              type="caption"
              style={[styles.connectedText, { color: theme.accent }]}
            >
              Pending
            </ThemedText>
          </View>
        ) : (
          <Button onPress={handleConnect} style={styles.connectButton}>
            Connect
          </Button>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  metaText: {
    marginLeft: Spacing.xs,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: Spacing.sm,
  },
  bio: {
    marginTop: Spacing.md,
  },
  familyMembersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  familyMembersText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    alignItems: "center",
  },
  footer: {
    marginTop: Spacing.lg,
    alignItems: "flex-start",
  },
  connectButton: {
    paddingHorizontal: Spacing.xl,
    height: 40,
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  connectedText: {
    marginLeft: Spacing.xs,
    fontWeight: "500",
  },
});
