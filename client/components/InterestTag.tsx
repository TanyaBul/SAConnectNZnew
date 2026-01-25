import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface InterestTagProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  showRemove?: boolean;
  size?: "small" | "medium";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function InterestTag({
  label,
  selected = false,
  onPress,
  showRemove = false,
  size = "medium",
}: InterestTagProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };

  const containerStyle = [
    styles.container,
    size === "small" && styles.containerSmall,
    {
      backgroundColor: selected ? theme.primary : theme.backgroundSecondary,
      borderColor: selected ? theme.primary : theme.border,
    },
  ];

  const content = (
    <View style={styles.content}>
      <ThemedText
        type={size === "small" ? "small" : "caption"}
        style={[
          styles.label,
          { color: selected ? "#FFFFFF" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
      {showRemove ? (
        <Feather
          name="x"
          size={14}
          color={selected ? "#FFFFFF" : theme.textSecondary}
          style={styles.removeIcon}
        />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[containerStyle, animatedStyle]}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  containerSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontWeight: "500",
  },
  removeIcon: {
    marginLeft: Spacing.xs,
  },
});
