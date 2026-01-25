import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface EmptyStateProps {
  image: "discover" | "messages" | "community" | "events";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const IMAGES = {
  discover: require("../../assets/images/empty-discover.png"),
  messages: require("../../assets/images/empty-messages.png"),
  community: require("../../assets/images/empty-community.png"),
  events: require("../../assets/images/empty-events.png"),
};

export function EmptyState({
  image,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Image
        source={IMAGES[image]}
        style={styles.image}
        contentFit="contain"
      />
      <ThemedText type="heading" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.description, { color: theme.textSecondary }]}
      >
        {description}
      </ThemedText>
      {actionLabel && onAction ? (
        <Button onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  button: {
    paddingHorizontal: Spacing["3xl"],
  },
});
