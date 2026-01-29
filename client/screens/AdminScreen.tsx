import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { formatRelativeTime } from "@/lib/storage";

interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    familyName: string;
    avatarUrl: string | null;
  };
  reportedUser: {
    id: string;
    familyName: string;
    avatarUrl: string | null;
  };
}

interface Block {
  id: string;
  userId: string;
  blockedUserId: string;
  createdAt: string;
  user: {
    id: string;
    familyName: string;
    avatarUrl: string | null;
  };
  blockedUser: {
    id: string;
    familyName: string;
    avatarUrl: string | null;
  };
}

type TabType = "reports" | "blocks";

export default function AdminScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [activeTab, setActiveTab] = useState<TabType>("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [reportsRes, blocksRes] = await Promise.all([
        fetch(new URL("/api/admin/reports", getApiUrl()).toString()),
        fetch(new URL("/api/admin/blocks", getApiUrl()).toString()),
      ]);

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }

      if (blocksRes.ok) {
        const blocksData = await blocksRes.json();
        setBlocks(blocksData);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
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

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(
        new URL(`/api/admin/reports/${reportId}`, getApiUrl()).toString(),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "reviewed":
        return theme.accent;
      case "resolved":
        return theme.success;
      case "dismissed":
        return theme.textSecondary;
      default:
        return theme.textSecondary;
    }
  };

  const renderReport = ({ item }: { item: Report }) => (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <ThemedText type="small" style={{ color: getStatusColor(item.status), fontWeight: "600" }}>
            {item.status.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatRelativeTime(item.createdAt)}
        </ThemedText>
      </View>

      <View style={styles.userRow}>
        <Avatar uri={item.reporter.avatarUrl} size="small" />
        <View style={styles.userInfo}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Reported by
          </ThemedText>
          <ThemedText type="body" style={{ fontWeight: "500" }}>
            {item.reporter.familyName}
          </ThemedText>
        </View>
      </View>

      <View style={styles.userRow}>
        <Avatar uri={item.reportedUser.avatarUrl} size="small" />
        <View style={styles.userInfo}>
          <ThemedText type="small" style={{ color: theme.error }}>
            Reported user
          </ThemedText>
          <ThemedText type="body" style={{ fontWeight: "500" }}>
            {item.reportedUser.familyName}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.reasonBox, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          Reason
        </ThemedText>
        <ThemedText type="body" style={{ marginTop: Spacing.xs }}>
          {item.reason}
        </ThemedText>
        {item.details ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
            {item.details}
          </ThemedText>
        ) : null}
      </View>

      {item.status === "pending" ? (
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.success + "15" }]}
            onPress={() => updateReportStatus(item.id, "resolved")}
          >
            <Feather name="check" size={16} color={theme.success} />
            <ThemedText type="small" style={{ color: theme.success, marginLeft: Spacing.xs }}>
              Resolve
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.textSecondary + "15" }]}
            onPress={() => updateReportStatus(item.id, "dismissed")}
          >
            <Feather name="x" size={16} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
              Dismiss
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  const renderBlock = ({ item }: { item: Block }) => (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: theme.error + "20" }]}>
          <ThemedText type="small" style={{ color: theme.error, fontWeight: "600" }}>
            BLOCKED
          </ThemedText>
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatRelativeTime(item.createdAt)}
        </ThemedText>
      </View>

      <View style={styles.blockRow}>
        <View style={styles.blockUser}>
          <Avatar uri={item.user.avatarUrl} size="small" />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm, fontWeight: "500" }}>
            {item.user.familyName}
          </ThemedText>
        </View>
        <Feather name="arrow-right" size={16} color={theme.textSecondary} />
        <View style={styles.blockUser}>
          <Avatar uri={item.blockedUser.avatarUrl} size="small" />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm, fontWeight: "500" }}>
            {item.blockedUser.familyName}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabs}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "reports" && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("reports")}
        >
          <ThemedText
            type="body"
            style={[
              styles.tabText,
              { color: activeTab === "reports" ? theme.primary : theme.textSecondary },
            ]}
          >
            Reports
          </ThemedText>
          {pendingCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.error }]}>
              <ThemedText type="small" style={{ color: "#fff", fontWeight: "600" }}>
                {pendingCount}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === "blocks" && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("blocks")}
        >
          <ThemedText
            type="body"
            style={[
              styles.tabText,
              { color: activeTab === "blocks" ? theme.primary : theme.textSecondary },
            ]}
          >
            Blocks
          </ThemedText>
          {blocks.length > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.textSecondary }]}>
              <ThemedText type="small" style={{ color: "#fff", fontWeight: "600" }}>
                {blocks.length}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
      </View>

      {activeTab === "reports" ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="check-circle" size={48} color={theme.success} />
              <ThemedText type="heading" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
                No Reports
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                All clear! No user reports to review.
              </ThemedText>
            </View>
          }
        />
      ) : (
        <FlatList
          data={blocks}
          keyExtractor={(item) => item.id}
          renderItem={renderBlock}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="users" size={48} color={theme.textSecondary} />
              <ThemedText type="heading" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
                No Blocks
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                No users have blocked each other yet.
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  tabText: {
    fontWeight: "500",
  },
  badge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  userInfo: {
    marginLeft: Spacing.md,
  },
  reasonBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  blockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  blockUser: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
});
