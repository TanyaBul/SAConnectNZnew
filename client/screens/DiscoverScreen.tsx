import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FamilyCard } from "@/components/FamilyCard";
import { Avatar } from "@/components/Avatar";
import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { getFamilies, getConnections, addConnection, updateConnectionStatus, getOrCreateThread, getThreads, Family, Connection, MessageThread } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type TabType = "families" | "connected" | "pending" | "messages";

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
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);

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

  useEffect(() => {
    const checkAvatarPromptDismissed = async () => {
      if (!user?.avatarUrl) {
        const dismissed = await AsyncStorage.getItem('@sa_connect_avatar_prompt_dismissed');
        setShowAvatarPrompt(!dismissed);
      }
    };
    checkAvatarPromptDismissed();
  }, [user?.avatarUrl]);

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

  const connectedFamilies = connections.filter(
    c => c.status === "connected" && (c as any).otherUser
  );

  const unreadMessagesCount = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  const handleMessageFromDiscover = async (otherUser: any) => {
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

  const handleDismissAvatarPrompt = async () => {
    await AsyncStorage.setItem('@sa_connect_avatar_prompt_dismissed', 'true');
    setShowAvatarPrompt(false);
  };

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
    const otherUser = (item as any).otherUser;
    const familyName = otherUser?.familyName || "Unknown Family";
    const avatarUrl = otherUser?.avatarUrl || null;
    
    return (
      <View style={[styles.pendingCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
        <View style={styles.pendingHeader}>
          <Avatar uri={avatarUrl} size="medium" />
          <View style={styles.pendingInfo}>
            <ThemedText type="heading" numberOfLines={1}>
              {familyName}
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

        {showAvatarPrompt && !user?.avatarUrl ? (
          <View style={[styles.avatarPromptBanner, { backgroundColor: theme.backgroundSecondary, ...Shadows.card }]}>
            <View style={styles.bannerContent}>
              <Feather name="camera" size={24} color={theme.secondary} />
              <ThemedText type="body" style={[styles.bannerText, { color: theme.text }]}>
                Add a family photo to help others recognise you!
              </ThemedText>
            </View>
            <View style={styles.bannerActions}>
              <Pressable
                onPress={() => navigation.navigate("EditProfile")}
                style={[styles.addPhotoButton, { backgroundColor: theme.secondary }]}
              >
                <ThemedText type="body" style={[styles.addPhotoButtonText, { fontWeight: "600" }]}>
                  Add Photo
                </ThemedText>
              </Pressable>
              <Pressable onPress={handleDismissAvatarPrompt} style={styles.dismissButton}>
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>
        ) : null}

        {families.length < 10 ? (
          <View style={[styles.welcomeCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
            <View style={styles.welcomeIconRow}>
              <Feather name="heart" size={20} color={theme.primary} />
            </View>
            <ThemedText type="body" style={[styles.welcomeTitle, { color: theme.text }]}>
              Thank you for joining SA Connect NZ!
            </ThemedText>
            <ThemedText type="caption" style={[styles.welcomeText, { color: theme.textSecondary }]}>
              We're just getting started. As more South African families join in your area, you'll be able to discover and connect with them here. Check back regularly — new families are joining every day!
            </ThemedText>
          </View>
        ) : null}

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
                size={22} 
                color={activeTab === "families" ? theme.primary : theme.textSecondary} 
              />
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === "connected" && { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() => setActiveTab("connected")}
            >
              <Feather 
                name="heart" 
                size={22} 
                color={activeTab === "connected" ? theme.primary : theme.textSecondary} 
              />
              {connectedFamilies.length > 0 ? (
                <View style={[styles.tabBadge, { backgroundColor: theme.success }]}>
                  <ThemedText type="small" style={{ color: "#fff", fontWeight: "600", fontSize: 10 }}>
                    {connectedFamilies.length}
                  </ThemedText>
                </View>
              ) : null}
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
                size={22} 
                color={activeTab === "pending" ? theme.primary : theme.textSecondary} 
              />
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
                size={22} 
                color={activeTab === "messages" ? theme.primary : theme.textSecondary} 
              />
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

        {activeTab === "connected" ? (
          connectedFamilies.length > 0 ? (
            connectedFamilies.map((conn) => {
              const otherUser = (conn as any).otherUser;
              if (!otherUser) return null;
              return (
                <View key={conn.id} style={styles.cardWrapper}>
                  <View style={[styles.connectedCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
                    <Pressable
                      style={styles.connectedInfo}
                      onPress={() =>
                        navigation.navigate("FamilyDetail", {
                          family: {
                            id: otherUser.id,
                            familyName: otherUser.familyName,
                            avatarUrl: otherUser.avatarUrl,
                          } as any,
                        })
                      }
                    >
                      <Avatar uri={otherUser.avatarUrl} size="medium" />
                      <View style={styles.connectedDetails}>
                        <ThemedText type="body" style={{ fontWeight: "600" }} numberOfLines={1}>
                          {otherUser.familyName}
                        </ThemedText>
                        <ThemedText type="caption" style={{ color: theme.success }}>
                          Connected
                        </ThemedText>
                      </View>
                    </Pressable>
                    <Pressable
                      style={[styles.connectedMessageBtn, { backgroundColor: theme.primary + "15" }]}
                      onPress={() => handleMessageFromDiscover(otherUser)}
                    >
                      <Feather name="message-circle" size={20} color={theme.primary} />
                    </Pressable>
                  </View>
                </View>
              );
            })
          ) : (
            <EmptyState
              image="discover"
              title="No Connections Yet"
              description="When you connect with other SA families, they'll appear here for easy messaging."
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
  welcomeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  welcomeIconRow: {
    marginBottom: Spacing.sm,
  },
  welcomeTitle: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  welcomeText: {
    lineHeight: 20,
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  tabBadge: {
    position: "absolute",
    top: 4,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
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
  connectedCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  connectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  connectedDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  connectedMessageBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
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
  avatarPromptBanner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginBottom: Spacing.md,
  },
  bannerText: {
    flex: 1,
    marginLeft: Spacing.md,
    fontWeight: "500",
  },
  bannerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  addPhotoButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoButtonText: {
    color: "#FFFFFF",
  },
  dismissButton: {
    padding: Spacing.sm,
  },
});
