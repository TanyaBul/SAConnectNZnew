import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { FamilyCard } from "@/components/FamilyCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getFamilies, getConnections, addConnection, Family, Connection } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [families, setFamilies] = useState<Family[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [familiesData, connectionsData] = await Promise.all([
        getFamilies(),
        getConnections(),
      ]);
      setFamilies(familiesData.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
      setConnections(connectionsData);
    } catch (error) {
      console.error("Error loading data:", error);
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

  const handleConnect = async (familyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const newConnection = await addConnection(familyId);
      setConnections([...connections, newConnection]);
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  const getConnectionStatus = (familyId: string) => {
    const connection = connections.find(
      (c) => c.targetUserId === familyId || c.userId === familyId
    );
    return connection?.status;
  };

  const handleFamilyPress = (family: Family) => {
    navigation.navigate("FamilyDetail", { family });
  };

  const renderItem = ({ item }: { item: Family }) => {
    const status = getConnectionStatus(item.id);
    return (
      <FamilyCard
        id={item.id}
        familyName={item.familyName}
        bio={item.bio}
        avatarUrl={item.avatarUrl}
        distance={item.distance || 0}
        interests={item.interests}
        membersCount={item.familyMembers?.length || 0}
        onPress={() => handleFamilyPress(item)}
        onConnect={() => handleConnect(item.id)}
        isConnected={status === "connected"}
        isPending={status === "pending"}
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
        data={families}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.lg,
          },
          families.length === 0 && styles.emptyList,
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
            image="discover"
            title="No Families Nearby Yet"
            description="Be the first to join! Once more SA families sign up in your area, they'll appear here."
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
