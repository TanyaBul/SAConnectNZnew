import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ConversationItemProps {
  id: string;
  familyName: string;
  avatarUrl: string | null;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ConversationItem({
  familyName,
  avatarUrl,
  lastMessage,
  timestamp,
  unreadCount,
  onPress,
}: ConversationItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    opacity.value = withSpring(0.7);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <Avatar uri={avatarUrl} size="medium" />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText
            type="heading"
            numberOfLines={1}
            style={[styles.name, unreadCount > 0 && { fontWeight: "700" }]}
          >
            {familyName}
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary }}
          >
            {timestamp}
          </ThemedText>
        </View>
        <View style={styles.messageRow}>
          <ThemedText
            type="body"
            numberOfLines={1}
            style={[
              styles.message,
              {
                color: unreadCount > 0 ? theme.text : theme.textSecondary,
                fontWeight: unreadCount > 0 ? "500" : "400",
              },
            ]}
          >
            {lastMessage}
          </ThemedText>
          {unreadCount > 0 ? (
            <View
              style={[styles.badge, { backgroundColor: theme.primary }]}
            >
              <ThemedText type="small" style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  name: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  message: {
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 11,
  },
});
