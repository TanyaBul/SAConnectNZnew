import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { InterestTag } from "@/components/InterestTag";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getConnections, getOrCreateThread } from "@/lib/storage";

interface EnrichedConnection {
  id: string;
  userId: string;
  targetUserId: string;
  status: string;
  otherUser: {
    id: string;
    familyName: string;
    avatarUrl: string | null;
  } | null;
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [connections, setConnections] = useState<EnrichedConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        setLoadingConnections(true);
        getConnections(user.id)
          .then((data) => {
            setConnections(data.filter((c: any) => c.status === "connected" && c.otherUser));
          })
          .finally(() => setLoadingConnections(false));
      }
    }, [user?.id])
  );

  const handleMessageConnection = async (otherUser: EnrichedConnection["otherUser"]) => {
    if (!user?.id || !otherUser) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const thread = await getOrCreateThread(user.id, otherUser.id);
      if (thread) {
        navigation.navigate("Chat", {
          threadId: thread.id,
          family: { id: otherUser.id, familyName: otherUser.familyName, avatarUrl: otherUser.avatarUrl } as any,
        });
      }
    } catch (error) {
      console.error("Error starting message:", error);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Please sign in</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={styles.header}>
          <Avatar uri={user.avatarUrl} size="xlarge" showEditBadge onPress={() => {}} />
          <ThemedText type="h3" style={styles.familyName}>
            {user.familyName}
          </ThemedText>
          {user.location ? (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText
                type="body"
                style={[styles.locationText, { color: theme.textSecondary }]}
              >
                {user.location.suburb}, {user.location.city}
              </ThemedText>
            </View>
          ) : (
            <Pressable
              style={[styles.addLocationButton, { borderColor: theme.border }]}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Feather name="map-pin" size={16} color={theme.primary} />
              <ThemedText type="caption" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
                Add your location
              </ThemedText>
            </Pressable>
          )}
        </View>

        {user.bio ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              About
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {user.bio}
            </ThemedText>
          </View>
        ) : (
          <Pressable
            style={[styles.addSection, { borderColor: theme.border }]}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Feather name="edit-2" size={20} color={theme.primary} />
            <ThemedText type="body" style={{ color: theme.primary, marginLeft: Spacing.sm }}>
              Add a bio about your family
            </ThemedText>
          </Pressable>
        )}

        {user.familyMembers && user.familyMembers.length > 0 ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Family Members
            </ThemedText>
            <View style={styles.membersGrid}>
              {user.familyMembers.map((member) => (
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

        {user.interests.length > 0 ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Interests
            </ThemedText>
            <View style={styles.interestsGrid}>
              {user.interests.map((interest) => (
                <InterestTag key={interest} label={interest} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              My Connections
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {connections.length} {connections.length === 1 ? "family" : "families"}
            </ThemedText>
          </View>
          {loadingConnections ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ paddingVertical: Spacing.lg }} />
          ) : connections.length > 0 ? (
            <View style={styles.connectionsGrid}>
              {connections.map((conn) => {
                if (!conn.otherUser) return null;
                return (
                  <View
                    key={conn.id}
                    style={[styles.connectionCard, { backgroundColor: theme.backgroundSecondary }]}
                  >
                    <Pressable
                      style={styles.connectionInfo}
                      onPress={() =>
                        navigation.navigate("FamilyDetail", {
                          family: {
                            id: conn.otherUser!.id,
                            familyName: conn.otherUser!.familyName,
                            avatarUrl: conn.otherUser!.avatarUrl,
                          } as any,
                        })
                      }
                    >
                      <Avatar uri={conn.otherUser.avatarUrl} size="medium" />
                      <ThemedText type="body" style={styles.connectionName} numberOfLines={1}>
                        {conn.otherUser.familyName}
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.messageIcon, { backgroundColor: theme.primary + "15" }]}
                      onPress={() => handleMessageConnection(conn.otherUser)}
                      testID={`button-message-${conn.otherUser.id}`}
                    >
                      <Feather name="message-circle" size={20} color={theme.primary} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyConnections}>
              <Feather name="users" size={32} color={theme.textSecondary + "60"} />
              <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                No connections yet. Discover SA families nearby!
              </ThemedText>
            </View>
          )}
        </View>

        <Button
          onPress={() => navigation.navigate("EditProfile")}
          variant="outline"
          style={styles.editButton}
        >
          Edit Profile
        </Button>

        <Button
          onPress={() => navigation.navigate("Settings")}
          variant="ghost"
          style={styles.settingsButton}
        >
          Settings
        </Button>
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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  locationText: {
    marginLeft: Spacing.xs,
  },
  addLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  addSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginBottom: Spacing.lg,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  connectionsGrid: {
    gap: Spacing.sm,
  },
  connectionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  connectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  connectionName: {
    fontWeight: "500",
    marginLeft: Spacing.md,
    flex: 1,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyConnections: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  editButton: {
    marginTop: Spacing.lg,
  },
  settingsButton: {
    marginTop: Spacing.sm,
  },
});
