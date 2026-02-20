import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, Modal, Dimensions, ActivityIndicator, Alert, Platform, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { InterestTag } from "@/components/InterestTag";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { showImagePickerOptions, launchCamera, launchImageLibrary } from "@/lib/imagePicker";
import { getFamilyPhotos, uploadFamilyPhoto, deleteFamilyPhoto, FamilyPhoto } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";

const MAX_PHOTOS = 5;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, updateProfile, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [photos, setPhotos] = useState<FamilyPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [togglingHidden, setTogglingHidden] = useState(false);

  const loadPhotos = useCallback(async () => {
    if (!user?.id) return;
    const data = await getFamilyPhotos(user.id);
    setPhotos(data);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos])
  );

  const handleAvatarPress = () => {
    showImagePickerOptions(
      async () => {
        const result = await launchCamera();
        if (result) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await updateProfile({ avatarUrl: result.base64 || result.uri });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      },
      async () => {
        const result = await launchImageLibrary();
        if (result) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await updateProfile({ avatarUrl: result.base64 || result.uri });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    );
  };

  const handleAddPhoto = () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert("Photo Limit", `You can add up to ${MAX_PHOTOS} family photos.`);
      return;
    }

    showImagePickerOptions(
      async () => {
        const result = await launchCamera();
        if (result && user?.id) {
          setUploading(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const photo = await uploadFamilyPhoto(user.id, result.base64 || result.uri);
          if (photo) {
            setPhotos((prev) => [...prev, photo]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setUploading(false);
        }
      },
      async () => {
        const result = await launchImageLibrary();
        if (result && user?.id) {
          setUploading(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const photo = await uploadFamilyPhoto(user.id, result.base64 || result.uri);
          if (photo) {
            setPhotos((prev) => [...prev, photo]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setUploading(false);
        }
      }
    );
  };

  const handleDeletePhoto = (photoId: string) => {
    if (Platform.OS === "web") {
      if (user?.id) {
        doDeletePhoto(photoId);
      }
      return;
    }

    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove this photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            if (user?.id) {
              doDeletePhoto(photoId);
            }
          },
        },
      ]
    );
  };

  const doDeletePhoto = async (photoId: string) => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await deleteFamilyPhoto(user.id, photoId);
    if (success) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getPhotoUri = (photoUrl: string) => {
    if (photoUrl.startsWith("/api/") || photoUrl.startsWith("/uploads/")) {
      return new URL(photoUrl, getApiUrl()).toString();
    }
    return photoUrl;
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshUser(), loadPhotos()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, loadPhotos]);

  const handleToggleHidden = async (newValue: boolean) => {
    setTogglingHidden(true);
    try {
      await updateProfile({ profileHidden: newValue });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Failed to toggle profile visibility:", error);
    }
    setTogglingHidden(false);
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.header}>
          <Avatar uri={user.avatarUrl} size="xlarge" showEditBadge onPress={handleAvatarPress} />
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

        {user.profileHidden ? (
          <View style={[styles.hiddenBanner, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
            <View style={styles.hiddenBannerTop}>
              <Feather name="eye-off" size={20} color="#92400E" />
              <ThemedText type="body" style={[styles.hiddenBannerTitle, { color: "#92400E" }]}>
                Your profile is hidden
              </ThemedText>
            </View>
            <ThemedText type="small" style={{ color: "#92400E", marginBottom: Spacing.md }}>
              Other families cannot see you in Discover. Your existing connections and messages are still active.
            </ThemedText>
            <Pressable
              style={[styles.hiddenBannerButton, { backgroundColor: "#F59E0B" }]}
              onPress={() => handleToggleHidden(false)}
              disabled={togglingHidden}
            >
              <Feather name="eye" size={16} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600", marginLeft: Spacing.sm }}>
                {togglingHidden ? "Updating..." : "Make Profile Visible"}
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        <View style={[styles.visibilityRow, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.visibilityInfo}>
            <Feather name={user.profileHidden ? "eye-off" : "eye"} size={20} color={user.profileHidden ? theme.textSecondary : theme.primary} />
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <ThemedText type="body" style={{ fontWeight: "500" }}>
                {user.profileHidden ? "Profile Hidden" : "Profile Visible"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {user.profileHidden ? "Not shown in Discover" : "Visible to other families"}
              </ThemedText>
            </View>
          </View>
          <Switch
            value={user.profileHidden || false}
            onValueChange={handleToggleHidden}
            disabled={togglingHidden}
            trackColor={{ false: theme.border, true: "#F59E0B" }}
            thumbColor="#FFFFFF"
            testID="toggle-hide-profile"
          />
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

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Family Photos
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {photos.length}/{MAX_PHOTOS}
            </ThemedText>
          </View>
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <Pressable
                key={photo.id}
                style={styles.photoItem}
                onPress={() => {
                  setSelectedPhotoIndex(index);
                  setPhotoViewerVisible(true);
                }}
              >
                <Image
                  source={{ uri: getPhotoUri(photo.photoUrl) }}
                  style={styles.photoImage}
                  contentFit="cover"
                />
                <Pressable
                  style={[styles.deletePhotoBadge, { backgroundColor: theme.error }]}
                  onPress={() => handleDeletePhoto(photo.id)}
                  testID={`delete-photo-${photo.id}`}
                >
                  <Feather name="x" size={12} color="#FFFFFF" />
                </Pressable>
              </Pressable>
            ))}
            {photos.length < MAX_PHOTOS ? (
              <Pressable
                style={[styles.addPhotoButton, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
                onPress={handleAddPhoto}
                disabled={uploading}
                testID="add-family-photo"
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <>
                    <Feather name="plus" size={24} color={theme.primary} />
                    <ThemedText type="small" style={{ color: theme.primary, marginTop: Spacing.xs }}>
                      Add
                    </ThemedText>
                  </>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>

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

      <Modal
        visible={photoViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoViewerVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.photoViewerOverlay}>
          <Pressable
            style={styles.photoViewerClose}
            onPress={() => setPhotoViewerVisible(false)}
          >
            <Feather name="x" size={28} color="#FFFFFF" />
          </Pressable>
          <ThemedText type="body" style={styles.photoViewerName}>
            {selectedPhotoIndex + 1} of {photos.length}
          </ThemedText>
          <View style={styles.photoViewerContent}>
            {photos[selectedPhotoIndex] ? (
              <Image
                source={{ uri: getPhotoUri(photos[selectedPhotoIndex].photoUrl) }}
                style={styles.photoViewerImage}
                contentFit="contain"
              />
            ) : null}
          </View>
          <View style={styles.photoViewerNav}>
            {selectedPhotoIndex > 0 ? (
              <Pressable
                style={styles.navButton}
                onPress={() => setSelectedPhotoIndex((i) => i - 1)}
              >
                <Feather name="chevron-left" size={32} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View style={styles.navButton} />
            )}
            {selectedPhotoIndex < photos.length - 1 ? (
              <Pressable
                style={styles.navButton}
                onPress={() => setSelectedPhotoIndex((i) => i + 1)}
              >
                <Feather name="chevron-right" size={32} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View style={styles.navButton} />
            )}
          </View>
          <Pressable
            style={styles.photoViewerBackground}
            onPress={() => setPhotoViewerVisible(false)}
          />
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  photoItem: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  deletePhotoBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoButton: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
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
  hiddenBanner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  hiddenBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  hiddenBannerTitle: {
    fontWeight: "700",
    marginLeft: Spacing.sm,
  },
  hiddenBannerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  visibilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  editButton: {
    marginTop: Spacing.lg,
  },
  settingsButton: {
    marginTop: Spacing.sm,
  },
  photoViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoViewerBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  photoViewerClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoViewerName: {
    position: "absolute",
    top: 56,
    left: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    zIndex: 10,
  },
  photoViewerContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  photoViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  photoViewerNav: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
