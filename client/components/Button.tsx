import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  loading?: boolean;
  size?: "small" | "medium" | "large";
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  loading = false,
  size = "medium",
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.border;
    switch (variant) {
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.secondary;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return theme.primary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.border;
    switch (variant) {
      case "outline":
        return theme.primary;
      default:
        return "transparent";
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textSecondary;
    switch (variant) {
      case "primary":
      case "secondary":
        return "#FFFFFF";
      case "outline":
      case "ghost":
        return theme.primary;
      default:
        return "#FFFFFF";
    }
  };

  const getHeight = () => {
    switch (size) {
      case "small":
        return 36;
      case "large":
        return 56;
      default:
        return Spacing.buttonHeight;
    }
  };

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: getHeight(),
          opacity: disabled ? 0.6 : 1,
        },
        variant === "outline" && styles.outline,
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <ThemedText
          type="body"
          style={[
            styles.buttonText,
            { color: getTextColor(), fontFamily: Typography.link.fontFamily },
          ]}
        >
          {children}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  outline: {
    borderWidth: 2,
  },
  buttonText: {
    fontWeight: "600",
  },
});
