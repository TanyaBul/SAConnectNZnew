import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { FamilyCard } from "@/components/FamilyCard";
import { Avatar } from "@/components/Avatar";
import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { getFamilies, getConnections, addConnection, updateConnectionStatus, getThreads, Family, Connection, MessageThread } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type TabType = "families" | "pending" | "messages";

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [activeTab, setActiveTab] = useState<TabType>("families");
  const [families, setFamilies] = useState<Family[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const [familiesData, connectionsData, threadsData] = await Promise.all([
        getFamilies(user.id),
        getConnections(user.id),
        getThreads(user.id),
      ]);
      setFamilies(familiesData.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
      setConnections(connectionsData);
      setThreads(threadsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleConnect = async (familyId: string) => {
    if (!user?.id) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const newConnection = await addConnection(user.id, familyId);
      if (newConnection) {
        setConnections([...connections, newConnection]);
      }
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await updateConnectionStatus(connectionId, "connected");
      setConnections(connections.map(c => 
        c.id === connectionId ? { ...c, status: "connected" } : c
      ));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDeclineRequest = async (connectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await updateConnectionStatus(connectionId, "rejected");
      setConnections(connections.filter(c => c.id !== connectionId));
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  const getConnectionStatus = (familyId: string) => {
    const connection = connections.find(
      (c) => c.targetUserId === familyId || c.userId === familyId
    );
    return connection?.status;
  };

  const handleFamilyPress = (family: Family) => {
    navigation.navigate("FamilyDetail", { family: family as any });
  };

  const pendingRequests = connections.filter(
    c => c.status === "pending" && c.targetUserId === user?.id
  );

  const unreadMessagesCount = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  const renderFamilyItem = ({ item }: { item: Family }) => {
    const status = getConnectionStatus(item.id);
    return (
      <FamilyCard
        id={item.id}
        familyName={item.familyName}
        bio={item.bio}
        avatarUrl={item.avatarUrl}
        distance={item.distance || 0}
        interests={item.interests}
        familyMembers={item.familyMembers || []}
        onPress={() => handleFamilyPress(item)}
        onConnect={() => handleConnect(item.id)}
        isConnected={status === "connected"}
        isPending={status === "pending"}
      />
    );
  };

  const renderPendingItem = ({ item }: { item: Connection }) => {
    const family = families.find(f => f.id === item.userId) || {
      id: item.userId,
      familyName: "Unknown Family",
      avatarUrl: null,
      bio: "",
      interests: [],
    };
    
    return (
      <View style={[styles.pendingCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
        <View style={styles.pendingHeader}>
          <Avatar uri={family.avatarUrl} size="medium" />
          <View style={styles.pendingInfo}>
            <ThemedText type="heading" numberOfLines={1}>
              {family.familyName}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Wants to connect with you
            </ThemedText>
          </View>
        </View>
        <View style={styles.pendingActions}>
          <Pressable
            style={[styles.declineButton, { borderColor: theme.border }]}
            onPress={() => handleDeclineRequest(item.id)}
          >
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Decline
            </ThemedText>
          </Pressable>
          <Button onPress={() => handleAcceptRequest(item.id)} style={styles.acceptButton}>
            Accept
          </Button>
        </View>
      </View>
    );
  };

  const renderMessageItem = ({ item }: { item: MessageThread }) => {
    const family = {
      id: item.otherUser.id,
      familyName: item.otherUser.familyName,
      avatarUrl: item.otherUser.avatarUrl,
      bio: "",
      interests: [],
      familyMembers: [],
      email: "",
      createdAt: "",
    } as Family;
    
    return (
      <Pressable
        style={[styles.messageCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}
        onPress={() => navigation.navigate("Chat", { threadId: item.id, family })}
      >
        <Avatar uri={item.otherUser.avatarUrl} size="medium" />
        <View style={styles.messageInfo}>
          <View style={styles.messageHeader}>
            <ThemedText type="body" style={{ fontWeight: "600", flex: 1 }} numberOfLines={1}>
              {item.otherUser.familyName}
            </ThemedText>
            {item.unreadCount > 0 ? (
              <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                <ThemedText type="small" style={{ color: "#fff", fontWeight: "600" }}>
                  {item.unreadCount}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <ThemedText 
            type="caption" 
            style={{ color: theme.textSecondary, marginTop: 2 }} 
            numberOfLines={1}
          >
            {item.lastMessage || "No messages yet"}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: tabBarHeight + Spacing.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        stickyHeaderIndices={[1]}
      >
        <Pressable
          style={[styles.profileCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}
          onPress={() => navigation.getParent()?.navigate("ProfileTab")}
        >
          <Avatar uri={user?.avatarUrl} size="large" />
          <View style={styles.profileInfo}>
            <ThemedText type="heading" numberOfLines={1}>
              {user?.familyName || "Your Family"}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {user?.location?.suburb ? `${user.location.suburb}, ${user.location.city}` : "Set your location"}
            </ThemedText>
            {user?.familyMembers && user.familyMembers.length > 0 ? (
              <ThemedText type="small" style={{ color: theme.secondary, marginTop: Spacing.xs }}>
                {user.familyMembers.map(m => m.name).join(", ")}
              </ThemedText>
            ) : null}
          </View>
          <Feather name="chevron-right" size={24} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.tabsContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.tabs, { backgroundColor: theme.backgroundSecondary }]}>
            <Pressable
              style={[
                styles.tab,
                activeTab === "families" && { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() => setActiveTab("families")}
            >
              <Feather 
                name="users" 
                size={16} 
                color={activeTab === "families" ? theme.primary : theme.textSecondary} 
              />
              <ThemedText
                type="caption"
                style={[
                  styles.tabText,
                  { color: activeTab === "families" ? theme.primary : theme.textSecondary },
                ]}
              >
                Families
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === "pending" && { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() => setActiveTab("pending")}
            >
              <Feather 
                name="user-plus" 
                size={16} 
                color={activeTab === "pending" ? theme.primary : theme.textSecondary} 
              />
              <ThemedText
                type="caption"
                style={[
                  styles.tabText,
                  { color: activeTab === "pending" ? theme.primary : theme.textSecondary },
                ]}
              >
                Requests
              </ThemedText>
              {pendingRequests.length > 0 ? (
                <View style={[styles.tabBadge, { backgroundColor: theme.error }]}>
                  <ThemedText type="small" style={{ color: "#fff", fontWeight: "600", fontSize: 10 }}>
                    {pendingRequests.length}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === "messages" && { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() => setActiveTab("messages")}
            >
              <Feather 
                name="message-circle" 
                size={16} 
                color={activeTab === "messages" ? theme.primary : theme.textSecondary} 
              />
              <ThemedText
                type="caption"
                style={[
                  styles.tabText,
                  { color: activeTab === "messages" ? theme.primary : theme.textSecondary },
                ]}
              >
                Messages
              </ThemedText>
              {unreadMessagesCount > 0 ? (
                <View style={[styles.tabBadge, { backgroundColor: theme.primary }]}>
                  <ThemedText type="small" style={{ color: "#fff", fontWeight: "600", fontSize: 10 }}>
                    {unreadMessagesCount}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        {activeTab === "families" ? (
          families.length > 0 ? (
            families.map((family) => (
              <View key={family.id} style={styles.cardWrapper}>
                {renderFamilyItem({ item: family })}
              </View>
            ))
          ) : (
            <EmptyState
              image="discover"
              title="No Families Nearby Yet"
              description="Be the first to join! Once more SA families sign up in your area, they'll appear here."
            />
          )
        ) : null}

        {activeTab === "pending" ? (
          pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <View key={request.id} style={styles.cardWrapper}>
                {renderPendingItem({ item: request })}
              </View>
            ))
          ) : (
            <EmptyState
              image="messages"
              title="No Pending Requests"
              description="When other families want to connect with you, their requests will appear here."
            />
          )
        ) : null}

        {activeTab === "messages" ? (
          threads.length > 0 ? (
            threads.map((thread) => (
              <View key={thread.id} style={styles.cardWrapper}>
                {renderMessageItem({ item: thread })}
              </View>
            ))
          ) : (
            <EmptyState
              image="messages"
              title="No Messages Yet"
              description="Connect with families to start chatting!"
            />
          )
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  tabsContainer: {
    paddingVertical: Spacing.sm,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  tabs: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  tabText: {
    fontWeight: "500",
  },
  tabBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    marginLeft: 2,
  },
  cardWrapper: {
    marginTop: Spacing.sm,
  },
  pendingCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  pendingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  pendingActions: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  declineButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  acceptButton: {
    flex: 1,
    height: 44,
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  messageInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
});
