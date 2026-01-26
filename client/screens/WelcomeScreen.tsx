import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={isDark ? ["#1A2A2A", "#264040"] : ["#E8F5F5", "#F0F9F9"]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={[styles.content, { paddingTop: insets.top + Spacing["5xl"] }]}>
        <Image
          source={require("../../assets/images/welcome-hero.png")}
          style={styles.heroImage}
          contentFit="cover"
        />
        
        <View style={styles.textContent}>
          <ThemedText type="h2" style={styles.title}>
            Find Your SA Family in New Zealand
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Connect with South African families nearby, share stories, memories, and meetups.
          </ThemedText>
          
          <View style={styles.features}>
            <FeatureBullet
              icon="map-pin"
              text="Search by area to meet nearby families"
            />
            <FeatureBullet
              icon="users"
              text="Create a family profile with your members"
            />
            <FeatureBullet
              icon="image"
              text="Share photos privately with your network"
            />
            <FeatureBullet
              icon="message-circle"
              text="Chat securely after you connect"
            />
          </View>
        </View>
      </View>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Button
          onPress={() => navigation.navigate("SignUp")}
          style={styles.primaryButton}
          size="large"
        >
          Get Started
        </Button>
        <Button
          onPress={() => navigation.navigate("SignIn")}
          variant="ghost"
          style={styles.secondaryButton}
        >
          I already have an account
        </Button>
      </View>
    </View>
  );
}

function FeatureBullet({ icon, text }: { icon: string; text: string }) {
  const { theme } = useTheme();
  const Feather = require("@expo/vector-icons").Feather;
  
  return (
    <View style={styles.featureRow}>
      <View style={[styles.iconCircle, { backgroundColor: theme.primary + "15" }]}>
        <Feather name={icon} size={16} color={theme.primary} />
      </View>
      <ThemedText type="caption" style={styles.featureText}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: width,
    height: height * 0.35,
    marginBottom: Spacing.xl,
  },
  textContent: {
    paddingHorizontal: Spacing.xl,
    flex: 1,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  features: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  primaryButton: {
    marginBottom: Spacing.md,
  },
  secondaryButton: {},
});
