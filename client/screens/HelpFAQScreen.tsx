import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Button } from "@/components/Button";

const SUPPORT_EMAIL = "saconnectnz@gmail.com";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How do I find other South African families near me?",
    answer: "Go to the Discover tab to see families in your area. You can filter by distance and interests to find families that match your preferences. Make sure location services are enabled for the best experience.",
  },
  {
    question: "How do I connect with another family?",
    answer: "When you find a family you'd like to connect with, tap on their profile and press the 'Connect' button. They'll receive a connection request, and once they accept, you can start chatting!",
  },
  {
    question: "How do I update my family profile?",
    answer: "Go to Settings and tap 'Edit Profile'. You can update your family name, bio, hometown in South Africa, interests, and add or remove family members.",
  },
  {
    question: "How do I add family members to my profile?",
    answer: "In your profile settings, scroll down to 'Family Members' and tap 'Add Family Member'. You can add each person's name, role (Parent, Child, etc.), and optionally their age.",
  },
  {
    question: "Can I control who sees my location?",
    answer: "Yes! In Settings, you can toggle 'Location Sharing' on or off. When off, other families won't see your distance or location. You can also adjust your location precision in your device settings.",
  },
  {
    question: "How do I create an event?",
    answer: "Go to the Events tab and tap the '+' button. Fill in the event details including title, description, date, time, and location. Your event will be visible to other families in the community.",
  },
  {
    question: "How do I delete my account?",
    answer: "Go to Settings and scroll to the bottom. Tap 'Delete Account' and confirm. Please note that account deletion is permanent and all your data, messages, and connections will be removed within 30 days.",
  },
  {
    question: "Why can't I see families near me?",
    answer: "Make sure location services are enabled for SA Connect NZ. Go to your device settings and ensure location access is granted. Also check that 'Location Sharing' is enabled in the app settings.",
  },
  {
    question: "Is my personal information safe?",
    answer: "Yes, we take your privacy seriously. Your data is encrypted and stored securely. We never share your personal information with third parties without your consent. Read our Privacy Policy for full details.",
  },
  {
    question: "How do I report inappropriate behavior?",
    answer: "If you encounter any inappropriate content or behavior, please contact us at saconnectnz@gmail.com with details about the issue. We review all reports and take appropriate action.",
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  return (
    <Pressable
      style={[styles.faqItem, { backgroundColor: theme.backgroundDefault }]}
      onPress={handlePress}
    >
      <View style={styles.faqHeader}>
        <ThemedText type="body" style={styles.question}>
          {item.question}
        </ThemedText>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.textSecondary}
        />
      </View>
      {expanded ? (
        <ThemedText type="small" style={[styles.answer, { color: theme.textSecondary }]}>
          {item.answer}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

export default function HelpFAQScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const handleEmailSupport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=SA Connect NZ Support Request`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      }
    } catch (error) {
      console.log("Could not open email client");
    }
  };

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
        <ThemedText type="title" style={styles.title}>
          How can we help?
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Find answers to common questions or reach out to our support team.
        </ThemedText>

        <View style={[styles.supportCard, { backgroundColor: theme.primary + "15" }]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
            <Feather name="mail" size={24} color="#FFFFFF" />
          </View>
          <ThemedText type="heading" style={styles.supportTitle}>
            Need more help?
          </ThemedText>
          <ThemedText type="body" style={[styles.supportText, { color: theme.textSecondary }]}>
            Our support team is here to assist you with any questions or issues.
          </ThemedText>
          <Button onPress={handleEmailSupport} style={styles.emailButton}>
            Email Support
          </Button>
          <ThemedText type="small" style={[styles.emailText, { color: theme.textSecondary }]}>
            {SUPPORT_EMAIL}
          </ThemedText>
        </View>

        <ThemedText type="heading" style={styles.sectionTitle}>
          Frequently Asked Questions
        </ThemedText>

        <View style={styles.faqList}>
          {FAQ_ITEMS.map((item, index) => (
            <FAQAccordion key={index} item={item} />
          ))}
        </View>

        <View style={[styles.bottomCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="message-circle" size={32} color={theme.primary} />
          <ThemedText type="body" style={[styles.bottomText, { color: theme.textSecondary }]}>
            Still have questions? We're happy to help!
          </ThemedText>
          <Pressable onPress={handleEmailSupport}>
            <ThemedText type="body" style={{ color: theme.primary }}>
              Contact us at {SUPPORT_EMAIL}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  supportCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  supportTitle: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  supportText: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  emailButton: {
    marginBottom: Spacing.sm,
  },
  emailText: {
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  faqList: {
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  faqItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  question: {
    flex: 1,
    marginRight: Spacing.md,
    fontWeight: "500",
  },
  answer: {
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  bottomCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
  },
  bottomText: {
    textAlign: "center",
    marginVertical: Spacing.md,
  },
});
