import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={styles.mainTitle}>
            Privacy Policy
          </ThemedText>
          <ThemedText type="caption" style={[styles.lastUpdated, { color: theme.textSecondary }]}>
            Last Updated: January 26, 2025
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            1. Introduction
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Welcome to SA Connect NZ ("we," "our," or "us"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            SA Connect NZ is a community platform designed to help South African families living in New Zealand connect with each other based on location, interests, and life stages.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            2. Information We Collect
          </ThemedText>
          
          <ThemedText type="body" style={[styles.subheading, { fontWeight: "600" }]}>
            2.1 Information You Provide
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Account Information: Family name, email address, and password when you create an account.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Profile Information: Bio, profile photos, family member names and ages, and interests/hobbies you choose to share.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Communications: Messages you send to other families through our in-app messaging feature.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • User-Generated Content: Photos, event listings, and other content you choose to share with the community.
          </ThemedText>

          <ThemedText type="body" style={[styles.subheading, { fontWeight: "600" }]}>
            2.2 Information Collected Automatically
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Location Data: With your permission, we collect your approximate location to show you nearby families and enable location-based discovery.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Device Information: Device type, operating system, and unique device identifiers.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Usage Data: How you interact with the app, features you use, and time spent on the app.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            3. How We Use Your Information
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We use your information to:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Provide and maintain the SA Connect NZ service
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Enable you to discover and connect with other South African families nearby
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Facilitate messaging between connected families
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Display community events and content
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Send important notifications about your account or connections
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Improve and personalize your experience
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Ensure the safety and security of our community
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            4. Information Sharing
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We share your information only in the following circumstances:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • With Other Users: Your public profile information (family name, bio, location area, interests) is visible to other SA Connect NZ users. Family member details are only visible to families you've connected with.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Service Providers: We may share data with trusted third-party services that help us operate the app (e.g., cloud hosting, analytics).
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Legal Requirements: We may disclose information if required by law or to protect the rights, safety, or property of SA Connect NZ, our users, or others.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We do not sell your personal information to third parties.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            5. Data Security
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            6. Your Rights and Choices
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            You have the right to:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Access: Request a copy of the personal information we hold about you.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Correction: Update or correct inaccurate information in your profile.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Deletion: Request deletion of your account and associated data.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Location: Disable location sharing at any time through your device settings or app preferences.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Notifications: Manage notification preferences in the app settings.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            7. Data Retention
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal purposes.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            8. Children's Privacy
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            SA Connect NZ is designed for families and is not directed at children under 13. Account holders must be at least 18 years old. While family profiles may include information about children (names and ages), this information is provided and controlled by the parent or guardian account holder.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            9. International Data Transfers
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Your information may be transferred to and processed in countries other than New Zealand. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            10. Changes to This Policy
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy in the app and updating the "Last Updated" date. Your continued use of SA Connect NZ after such changes constitutes acceptance of the updated policy.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            11. Contact Us
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Email: saconnectnz@gmail.com
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  mainTitle: {
    marginBottom: Spacing.xs,
  },
  lastUpdated: {
    fontStyle: "italic",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  subheading: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
});
