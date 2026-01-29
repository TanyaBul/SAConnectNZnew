import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

type Step = "email" | "code" | "newPassword" | "success";

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleRequestCode = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(new URL("/api/auth/forgot-password", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code");
      }

      if (data.token) {
        setResetToken(data.token);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("code");
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError("Please enter the reset code");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(new URL("/api/auth/verify-reset-token", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), token: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error("Invalid or expired reset code");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("newPassword");
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message || "Invalid reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(new URL("/api/auth/reset-password", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          token: code.trim(),
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("success");
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <ThemedText type="h3" style={styles.title}>
        Forgot Password?
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Enter your email address and we'll send you a code to reset your password.
      </ThemedText>

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="your.email@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          testID="input-reset-email"
        />
      </View>

      {error ? (
        <ThemedText type="caption" style={[styles.error, { color: theme.error }]}>
          {error}
        </ThemedText>
      ) : null}

      {resetToken ? (
        <View style={[styles.tokenInfo, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Your reset code: 
          </ThemedText>
          <ThemedText type="body" style={[styles.tokenText, { color: theme.primary }]}>
            {resetToken}
          </ThemedText>
        </View>
      ) : null}

      <Button onPress={handleRequestCode} loading={loading} style={styles.button} size="large">
        Send Reset Code
      </Button>
    </>
  );

  const renderCodeStep = () => (
    <>
      <ThemedText type="h3" style={styles.title}>
        Enter Reset Code
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Enter the 6-digit code sent to your email.
      </ThemedText>

      {resetToken ? (
        <View style={[styles.tokenInfo, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Your reset code: 
          </ThemedText>
          <ThemedText type="body" style={[styles.tokenText, { color: theme.primary }]}>
            {resetToken}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.form}>
        <Input
          label="Reset Code"
          placeholder="Enter 6-digit code"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          testID="input-reset-code"
        />
      </View>

      {error ? (
        <ThemedText type="caption" style={[styles.error, { color: theme.error }]}>
          {error}
        </ThemedText>
      ) : null}

      <Button onPress={handleVerifyCode} loading={loading} style={styles.button} size="large">
        Verify Code
      </Button>

      <Button variant="ghost" onPress={() => setStep("email")}>
        Use a different email
      </Button>
    </>
  );

  const renderNewPasswordStep = () => (
    <>
      <ThemedText type="h3" style={styles.title}>
        Create New Password
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Choose a strong password with at least 8 characters.
      </ThemedText>

      <View style={styles.form}>
        <Input
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          testID="input-new-password"
        />
        <Input
          label="Confirm Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          testID="input-confirm-password"
        />
      </View>

      {error ? (
        <ThemedText type="caption" style={[styles.error, { color: theme.error }]}>
          {error}
        </ThemedText>
      ) : null}

      <Button onPress={handleResetPassword} loading={loading} style={styles.button} size="large">
        Reset Password
      </Button>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <ThemedText type="h3" style={styles.title}>
        Password Reset!
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Your password has been successfully reset. You can now sign in with your new password.
      </ThemedText>

      <Button 
        onPress={() => navigation.navigate("SignIn")} 
        style={styles.button} 
        size="large"
      >
        Back to Sign In
      </Button>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        {step === "email" ? renderEmailStep() : null}
        {step === "code" ? renderCodeStep() : null}
        {step === "newPassword" ? renderNewPasswordStep() : null}
        {step === "success" ? renderSuccessStep() : null}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  form: {
    marginBottom: Spacing.md,
  },
  error: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  button: {
    marginBottom: Spacing.md,
  },
  tokenInfo: {
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
  },
  tokenText: {
    fontWeight: "700",
    fontSize: 24,
    letterSpacing: 4,
    marginTop: Spacing.xs,
  },
});
