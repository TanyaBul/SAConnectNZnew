import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { usePurchases } from "@/context/PurchaseContext";

const FEATURES = [
  {
    icon: "users" as const,
    title: "Unlimited Connections",
    description: "Connect with as many SA families as you like",
  },
  {
    icon: "message-circle" as const,
    title: "Private Messaging",
    description: "Chat directly with other families",
  },
  {
    icon: "map-pin" as const,
    title: "Location Discovery",
    description: "Find families in your area and across NZ",
  },
  {
    icon: "calendar" as const,
    title: "Community Events",
    description: "Create and join local SA community events",
  },
  {
    icon: "heart" as const,
    title: "Support the Community",
    description: "Help us grow and connect more SA families",
  },
];

export default function SubscriptionScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { 
    isSubscribed, 
    isLoading, 
    packages, 
    purchasePackage, 
    restorePurchases,
    customerInfo,
  } = usePurchases();

  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handlePurchase = async () => {
    if (packages.length === 0) return;
    
    setIsPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await purchasePackage(packages[selectedPackageIndex]);
    setIsPurchasing(false);
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await restorePurchases();
    setIsRestoring(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (isSubscribed) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.activeCard, { backgroundColor: theme.success + "15" }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.success }]}>
              <Feather name="check" size={32} color="#FFFFFF" />
            </View>
            <ThemedText type="title" style={styles.activeTitle}>
              You're Subscribed!
            </ThemedText>
            <ThemedText type="body" style={[styles.activeText, { color: theme.textSecondary }]}>
              Thank you for supporting SA Connect NZ. You have full access to all features.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Your Benefits
            </ThemedText>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: theme.primary + "15" }]}>
                  <Feather name={feature.icon} size={18} color={theme.primary} />
                </View>
                <View style={styles.featureText}>
                  <ThemedText type="body" style={{ fontWeight: "500" }}>
                    {feature.title}
                  </ThemedText>
                </View>
                <Feather name="check-circle" size={20} color={theme.success} />
              </View>
            ))}
          </View>

          <ThemedText type="small" style={[styles.manageText, { color: theme.textSecondary }]}>
            To manage or cancel your subscription, go to your device's App Store settings.
          </ThemedText>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Join SA Connect NZ
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Subscribe to connect with South African families across New Zealand
          </ThemedText>
        </View>

        <View style={styles.features}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: theme.primary + "15" }]}>
                <Feather name={feature.icon} size={20} color={theme.primary} />
              </View>
              <View style={styles.featureContent}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {feature.title}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {feature.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {packages.length > 0 ? (
          <View style={styles.packages}>
            {packages.map((pkg, index) => {
              const isSelected = selectedPackageIndex === index;
              const isMonthly = pkg.packageType === "MONTHLY";
              
              return (
                <Pressable
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    { 
                      backgroundColor: theme.backgroundDefault,
                      borderColor: isSelected ? theme.primary : theme.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedPackageIndex(index);
                  }}
                >
                  {!isMonthly ? (
                    <View style={[styles.saveBadge, { backgroundColor: theme.primary }]}>
                      <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                        Best Value
                      </ThemedText>
                    </View>
                  ) : null}
                  <View style={styles.packageHeader}>
                    <View 
                      style={[
                        styles.radioOuter, 
                        { borderColor: isSelected ? theme.primary : theme.border }
                      ]}
                    >
                      {isSelected ? (
                        <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                      ) : null}
                    </View>
                    <View>
                      <ThemedText type="heading">
                        {pkg.product.title || (isMonthly ? "Monthly" : "Annual")}
                      </ThemedText>
                      <ThemedText type="body" style={{ color: theme.textSecondary }}>
                        {pkg.product.priceString} / {isMonthly ? "month" : "year"}
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={[styles.noPackages, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="info" size={24} color={theme.textSecondary} />
            <ThemedText type="body" style={[styles.noPackagesText, { color: theme.textSecondary }]}>
              Subscription packages will be available when you download the app from the App Store or Google Play.
            </ThemedText>
          </View>
        )}

        <Button
          onPress={handlePurchase}
          loading={isPurchasing}
          disabled={packages.length === 0 || isPurchasing}
          style={styles.subscribeButton}
          size="large"
        >
          Subscribe Now
        </Button>

        <Pressable 
          style={styles.restoreButton} 
          onPress={handleRestore}
          disabled={isRestoring}
        >
          <ThemedText type="body" style={{ color: theme.primary }}>
            {isRestoring ? "Restoring..." : "Restore Purchases"}
          </ThemedText>
        </Pressable>

        <ThemedText type="small" style={[styles.terms, { color: theme.textSecondary }]}>
          Payment will be charged to your App Store or Google Play account. Subscription automatically 
          renews unless cancelled at least 24 hours before the end of the current period. You can 
          manage and cancel your subscription in your device's account settings.
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  packages: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  packageCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    position: "relative",
    overflow: "hidden",
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  saveBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.md,
  },
  noPackages: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  noPackagesText: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
  subscribeButton: {
    marginBottom: Spacing.md,
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
  },
  terms: {
    textAlign: "center",
    lineHeight: 18,
  },
  activeCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  activeTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  activeText: {
    textAlign: "center",
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  featureText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  manageText: {
    textAlign: "center",
  },
});
