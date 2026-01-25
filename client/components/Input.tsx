import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  testID?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  error,
  autoCapitalize = "sentences",
  keyboardType = "default",
  testID,
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderScale = useSharedValue(1);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: borderScale.value }],
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderScale.value = withSpring(1.01);
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderScale.value = withSpring(1);
  };

  const borderColor = error
    ? theme.error
    : isFocused
    ? theme.primary
    : theme.border;

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText type="caption" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor,
          },
          multiline && { height: numberOfLines * 24 + 32 },
          animatedBorderStyle,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              fontFamily: Typography.body.fontFamily,
            },
            multiline && { textAlignVertical: "top", paddingTop: Spacing.md },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        ) : null}
      </Animated.View>
      {maxLength && multiline ? (
        <ThemedText
          type="small"
          style={[styles.charCount, { color: theme.textSecondary }]}
        >
          {value.length}/{maxLength}
        </ThemedText>
      ) : null}
      {error ? (
        <ThemedText type="small" style={[styles.error, { color: theme.error }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm,
    height: Spacing.inputHeight,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    height: "100%",
  },
  eyeButton: {
    paddingHorizontal: Spacing.lg,
    height: "100%",
    justifyContent: "center",
  },
  charCount: {
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  error: {
    marginTop: Spacing.xs,
  },
});
