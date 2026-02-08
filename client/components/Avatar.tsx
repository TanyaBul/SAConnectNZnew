import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

function resolveAvatarUri(uri: string | null | undefined): string | null {
  if (!uri) return null;
  if (uri.startsWith("http") || uri.startsWith("file://") || uri.startsWith("data:")) {
    return uri;
  }
  if (uri.startsWith("/uploads/")) {
    try {
      return new URL(uri, getApiUrl()).toString();
    } catch {
      return uri;
    }
  }
  return uri;
}

interface AvatarProps {
  uri?: string | null;
  size?: "small" | "medium" | "large" | "xlarge";
  onPress?: () => void;
  showEditBadge?: boolean;
}

const SIZES = {
  small: 40,
  medium: 56,
  large: 80,
  xlarge: 120,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Avatar({ uri, size = "medium", onPress, showEditBadge }: AvatarProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const dimension = SIZES[size];

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

  const resolvedUri = resolveAvatarUri(uri);

  const content = (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          borderColor: theme.border,
          backgroundColor: theme.backgroundSecondary,
        },
      ]}
    >
      {resolvedUri ? (
        <Image
          source={{ uri: resolvedUri }}
          style={[
            styles.image,
            {
              width: dimension - 8,
              height: dimension - 8,
              borderRadius: (dimension - 8) / 2,
            },
          ]}
          contentFit="cover"
        />
      ) : (
        <Image
          source={require("../../assets/images/avatar-default.png")}
          style={[
            styles.image,
            {
              width: dimension - 8,
              height: dimension - 8,
              borderRadius: (dimension - 8) / 2,
            },
          ]}
          contentFit="cover"
        />
      )}
      {showEditBadge ? (
        <View
          style={[
            styles.editBadge,
            {
              backgroundColor: theme.primary,
              borderColor: theme.backgroundDefault,
            },
          ]}
        >
          <Feather name="camera" size={12} color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    backgroundColor: "transparent",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
});
