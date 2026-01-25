import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Pressable, Dimensions, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { showImagePickerOptions, launchCamera, launchImageLibrary } from "@/lib/imagePicker";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { getPhotos, getFamilies, addPhoto, formatRelativeTime, Photo, Family } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - Spacing.lg * 3) / 2;

interface PhotoWithFamily extends Photo {
  family: Family | null;
}

export default function CommunityScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { user } = useAuth();

  const [photos, setPhotos] = useState<PhotoWithFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [photosData, familiesData] = await Promise.all([
        getPhotos(),
        getFamilies(),
      ]);
      
      const photosWithFamilies = photosData.map((photo) => {
        const family = familiesData.find((f) => f.id === photo.userId) || null;
        return { ...photo, family };
      });
      
      setPhotos(photosWithFamilies);
    } catch (error) {
      console.error("Error loading photos:", error);
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

  const handleAddPhoto = () => {
    showImagePickerOptions(
      async () => {
        const result = await launchCamera();
        if (result) {
          await savePhoto(result.uri);
        }
      },
      async () => {
        const result = await launchImageLibrary();
        if (result) {
          await savePhoto(result.uri);
        }
      }
    );
  };

  const savePhoto = async (uri: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const newPhoto = await addPhoto(user?.id || "user", uri, "");
      setPhotos([{ ...newPhoto, family: null }, ...photos]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error adding photo:", error);
    }
  };

  const renderPhoto = ({ item }: { item: PhotoWithFamily }) => (
    <Pressable
      style={[
        styles.photoCard,
        { backgroundColor: theme.backgroundDefault, ...Shadows.card },
      ]}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.photoImage}
        contentFit="cover"
      />
      <View style={styles.photoOverlay}>
        <Avatar uri={item.family?.avatarUrl} size="small" />
        <View style={styles.photoInfo}>
          <ThemedText type="small" style={styles.photoFamily} numberOfLines={1}>
            {item.family?.familyName || "Your Family"}
          </ThemedText>
          <ThemedText type="small" style={{ color: "rgba(255,255,255,0.7)" }}>
            {formatRelativeTime(item.uploadedAt)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );

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
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderPhoto}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.lg,
          },
          photos.length === 0 && styles.emptyList,
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
            image="community"
            title="No Photos Shared Yet"
            description="Be the first to share a photo with the SA community in New Zealand!"
            actionLabel="Share a Photo"
            onAction={handleAddPhoto}
          />
        }
      />
      
      {photos.length > 0 ? (
        <Pressable
          onPress={handleAddPhoto}
          style={[styles.fab, { backgroundColor: theme.primary, ...Shadows.fab }]}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}
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
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  photoCard: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  photoInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  photoFamily: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
