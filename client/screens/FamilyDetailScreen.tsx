import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { InterestTag } from "@/components/InterestTag";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { addConnection, getConnections } from "@/lib/storage";

export default function FamilyDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const route = useRoute<RouteProp<RootStackParamList, "FamilyDetail">>();
  const { family } = route.params;

  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const connections = await getConnections();
    const connection = connections.find(
      (c) => c.targetUserId === family.id || c.userId === family.id
    );
    if (connection) {
      setConnectionStatus(connection.status);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await addConnection(family.id);
      setConnectionStatus("pending");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error connecting:", error);
    } finally {
      setLoading(false);
    }
  };

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
      >
        <View style={styles.header}>
          <Avatar uri={family.avatarUrl} size="xlarge" />
          <ThemedText type="h3" style={styles.familyName}>
            {family.familyName}
          </ThemedText>
          
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={16} color={theme.textSecondary} />
            <ThemedText
              type="body"
              style={[styles.metaText, { color: theme.textSecondary }]}
            >
              {family.location?.suburb}, {family.location?.city}
            </ThemedText>
          </View>
          
          {family.distance !== undefined ? (
            <View style={[styles.distanceBadge, { backgroundColor: theme.secondary + "15" }]}>
              <ThemedText type="caption" style={{ color: theme.secondary }}>
                {family.distance < 1 ? "< 1" : family.distance} km away
              </ThemedText>
            </View>
          ) : null}
        </View>

        {family.bio ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              About
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {family.bio}
            </ThemedText>
          </View>
        ) : null}

        {family.familyMembers && family.familyMembers.length > 0 ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Family Members
            </ThemedText>
            <View style={styles.membersGrid}>
              {family.familyMembers.map((member) => (
                <View
                  key={member.id}
                  style={[styles.memberCard, { backgroundColor: theme.backgroundSecondary }]}
                >
                  <Feather name="user" size={20} color={theme.primary} />
                  <View style={styles.memberInfo}>
                    <ThemedText type="body" style={{ fontWeight: "500" }}>
                      {member.name}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {member.age} years old
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {family.interests.length > 0 ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Interests
            </ThemedText>
            <View style={styles.interestsGrid}>
              {family.interests.map((interest) => (
                <InterestTag key={interest} label={interest} />
              ))}
            </View>
          </View>
        ) : null}

        {connectionStatus === "connected" ? (
          <View style={[styles.connectedSection, { backgroundColor: theme.success + "15" }]}>
            <Feather name="check-circle" size={24} color={theme.success} />
            <ThemedText type="body" style={[styles.connectedText, { color: theme.success }]}>
              You're connected with this family!
            </ThemedText>
            <Button variant="secondary" style={styles.messageButton}>
              Send Message
            </Button>
          </View>
        ) : connectionStatus === "pending" ? (
          <View style={[styles.connectedSection, { backgroundColor: theme.accent + "15" }]}>
            <Feather name="clock" size={24} color={theme.accent} />
            <ThemedText type="body" style={[styles.connectedText, { color: theme.accent }]}>
              Connection request pending
            </ThemedText>
          </View>
        ) : (
          <Button
            onPress={handleConnect}
            loading={loading}
            size="large"
            style={styles.connectButton}
          >
            Send Connection Request
          </Button>
        )}
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
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  familyName: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  metaText: {
    marginLeft: Spacing.xs,
  },
  distanceBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  membersGrid: {
    gap: Spacing.sm,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  memberInfo: {
    marginLeft: Spacing.md,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  connectedSection: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  connectedText: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  messageButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
  },
  connectButton: {
    marginTop: Spacing.lg,
  },
});
