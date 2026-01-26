import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

export default function TermsOfServiceScreen() {
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
            Terms of Service
          </ThemedText>
          <ThemedText type="caption" style={[styles.lastUpdated, { color: theme.textSecondary }]}>
            Last Updated: January 26, 2025
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            1. Acceptance of Terms
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            By accessing or using SA Connect NZ ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            SA Connect NZ is operated by SA Connect NZ ("we," "our," or "us"). These Terms govern your use of our mobile application and related services.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            2. Eligibility
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            To use SA Connect NZ, you must:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Be at least 18 years of age
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Have the legal capacity to enter into a binding agreement
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Not be prohibited from using the App under applicable laws
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            By using the App, you represent and warrant that you meet these eligibility requirements.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            3. Account Registration
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            To access certain features, you must create an account. You agree to:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Provide accurate, current, and complete information during registration
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Maintain and promptly update your account information
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Keep your password secure and confidential
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Accept responsibility for all activities under your account
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Notify us immediately of any unauthorized use of your account
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            4. Community Guidelines
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            SA Connect NZ is a family-friendly community platform. You agree to:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Treat all members with respect and courtesy
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Provide truthful information about yourself and your family
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Use the App only for its intended purpose of connecting with other families
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Respect the privacy of other users and their families
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Report any suspicious or inappropriate behavior
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            5. Prohibited Conduct
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            You agree NOT to:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Post false, misleading, or deceptive information
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Harass, bully, intimidate, or threaten other users
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Share content that is illegal, harmful, hateful, or discriminatory
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Post sexually explicit, violent, or otherwise inappropriate content
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Use the App for commercial purposes, advertising, or solicitation
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Impersonate another person or misrepresent your identity
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Share personal information of others without their consent
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Attempt to gain unauthorized access to the App or other users' accounts
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Use automated systems or bots to access the App
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Violate any applicable laws or regulations
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            6. User-Generated Content
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            You retain ownership of content you post on SA Connect NZ. However, by posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content within the App for the purpose of operating the service.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            You are solely responsible for all content you post. You represent that you have all necessary rights to share the content and that it does not infringe on any third-party rights.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We reserve the right to remove any content that violates these Terms or that we deem inappropriate, without prior notice.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            7. Connections and Messaging
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            The App allows you to send connection requests and messages to other families. You understand that:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Other users may accept or decline your connection requests at their discretion
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Messages are private between connected families but may be reviewed if reported for violations
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • We are not responsible for the content of messages between users
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • You can block or report users who engage in inappropriate behavior
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            8. Events
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Users may create and share community events through the App. Event creators are responsible for the accuracy of event information. SA Connect NZ does not verify, endorse, or guarantee any events posted by users.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Attendance at events is at your own risk. We are not liable for any incidents, injuries, or damages that may occur at user-organized events.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            9. Intellectual Property
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            The App and its original content, features, and functionality are owned by SA Connect NZ and are protected by international copyright, trademark, and other intellectual property laws.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            You may not copy, modify, distribute, sell, or lease any part of the App without our prior written consent.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            10. Account Termination
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including but not limited to:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Violation of these Terms
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Behavior that harms other users or the community
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Suspected fraudulent or illegal activity
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            You may delete your account at any time through the App settings.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            11. Disclaimers
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE APP WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We do not verify the identity or background of users. You are responsible for taking appropriate precautions when meeting or interacting with other users.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            12. Limitation of Liability
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SA CONNECT NZ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We are not responsible for the actions, content, or conduct of other users.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            13. Indemnification
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            You agree to indemnify and hold harmless SA Connect NZ, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the App or violation of these Terms.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            14. Governing Law
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            These Terms shall be governed by and construed in accordance with the laws of New Zealand. Any disputes arising from these Terms or your use of the App shall be subject to the exclusive jurisdiction of the courts of New Zealand.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            15. Changes to Terms
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We may modify these Terms at any time. We will notify you of any material changes by posting the updated Terms in the App. Your continued use of the App after such changes constitutes acceptance of the new Terms.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            16. Contact Us
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            If you have questions about these Terms of Service, please contact us at:
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
  paragraph: {
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
});
