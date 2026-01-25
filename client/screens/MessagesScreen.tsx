import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ConversationItem } from "@/components/ConversationItem";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getThreads, getFamilies, formatRelativeTime, MessageThread, Family } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

interface ThreadWithFamily extends MessageThread {
  family: Family | null;
}

export default function MessagesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [threads, setThreads] = useState<ThreadWithFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [threadsData, familiesData] = await Promise.all([
        getThreads(),
        getFamilies(),
      ]);
      
      const threadsWithFamilies = threadsData.map((thread) => {
        const otherParticipantId = thread.participants.find((p) => p !== "user");
        const family = familiesData.find((f) => f.id === otherParticipantId) || null;
        return { ...thread, family };
      });
      
      setThreads(
        threadsWithFamilies.sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )
      );
    } catch (error) {
      console.error("Error loading threads:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleThreadPress = (thread: ThreadWithFamily) => {
    if (thread.family) {
      navigation.navigate("Chat", {
        threadId: thread.id,
        family: thread.family,
      });
    }
  };

  const renderItem = ({ item }: { item: ThreadWithFamily }) => {
    if (!item.family) return null;
    
    return (
      <ConversationItem
        id={item.id}
        familyName={item.family.familyName}
        avatarUrl={item.family.avatarUrl}
        lastMessage={item.lastMessage}
        timestamp={formatRelativeTime(item.lastMessageAt)}
        unreadCount={item.unreadCount}
        onPress={() => handleThreadPress(item)}
      />
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
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.lg,
          },
          threads.length === 0 && styles.emptyList,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            image="messages"
            title="No Messages Yet"
            description="Connect with other SA families to start chatting. Your conversations will appear here."
          />
        }
      />
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
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
});
