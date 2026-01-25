import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface MessageBubbleProps {
  text: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
}

export function MessageBubble({
  text,
  timestamp,
  isSent,
  isRead = false,
}: MessageBubbleProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        isSent ? styles.sentContainer : styles.receivedContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSent
            ? [styles.sentBubble, { backgroundColor: theme.primary }]
            : [styles.receivedBubble, { backgroundColor: theme.backgroundDefault }],
        ]}
      >
        <ThemedText
          type="body"
          style={[
            styles.text,
            { color: isSent ? "#FFFFFF" : theme.text },
          ]}
        >
          {text}
        </ThemedText>
      </View>
      <View style={[styles.meta, isSent && styles.metaSent]}>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary }}
        >
          {timestamp}
        </ThemedText>
        {isSent && isRead ? (
          <ThemedText
            type="small"
            style={[styles.readStatus, { color: theme.secondary }]}
          >
            Read
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    maxWidth: "80%",
  },
  sentContainer: {
    alignSelf: "flex-end",
  },
  receivedContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sentBubble: {
    borderRadius: BorderRadius.md,
    borderBottomRightRadius: Spacing.xs,
  },
  receivedBubble: {
    borderRadius: BorderRadius.md,
    borderBottomLeftRadius: Spacing.xs,
  },
  text: {
    lineHeight: 22,
  },
  meta: {
    flexDirection: "row",
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  metaSent: {
    justifyContent: "flex-end",
  },
  readStatus: {
    marginLeft: Spacing.sm,
  },
});
