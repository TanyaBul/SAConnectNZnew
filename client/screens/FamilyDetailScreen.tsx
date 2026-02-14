import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Modal, Pressable, TextInput, Dimensions, StatusBar, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { InterestTag } from "@/components/InterestTag";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { addConnection, getConnections, updateConnectionStatus, blockUser, reportUser, getOrCreateThread, REPORT_REASONS, getFamilyPhotos, FamilyPhoto } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";

export default function FamilyDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "FamilyDetail">>();
  const routeFamily = route.params.family;
  const { user } = useAuth();

  const [family, setFamily] = useState(routeFamily);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const [allViewerPhotos, setAllViewerPhotos] = useState<{ uri: string }[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isReceiver, setIsReceiver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [reportDetails, setReportDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [familyPhotos, setFamilyPhotos] = useState<FamilyPhoto[]>([]);

  useEffect(() => {
    loadFullProfile();
    checkConnection();
    loadFamilyPhotos();
  }, []);

  const loadFullProfile = async () => {
    if (!routeFamily?.id) return;
    if (routeFamily.interests && routeFamily.interests.length >= 0 && routeFamily.familyMembers) return;
    setLoadingProfile(true);
    try {
      const response = await fetch(new URL(`/api/users/${routeFamily.id}`, getApiUrl()).toString());
      if (response.ok) {
        const fullUser = await response.json();
        setFamily({
          ...routeFamily,
          ...fullUser,
          interests: fullUser.interests || [],
          familyMembers: fullUser.familyMembers || [],
          suburb: fullUser.suburb || routeFamily.suburb || "",
          city: fullUser.city || routeFamily.city || "",
          bio: fullUser.bio || routeFamily.bio || "",
        });
      }
    } catch (error) {
      console.error("Error loading full profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadFamilyPhotos = async () => {
    const photos = await getFamilyPhotos(family.id);
    setFamilyPhotos(photos);
  };

  const getPhotoUri = (photoUrl: string) => {
    if (photoUrl.startsWith("/api/") || photoUrl.startsWith("/uploads/")) {
      return new URL(photoUrl, getApiUrl()).toString();
    }
    return photoUrl;
  };

  const checkConnection = async () => {
    if (!user?.id) return;
    const connections = await getConnections(user.id);
    const connection = connections.find(
      (c) => c.targetUserId === family.id || c.userId === family.id
    );
    if (connection) {
      setConnectionStatus(connection.status);
      setConnectionId(connection.id);
      setIsReceiver(connection.targetUserId === user.id);
    }
  };

  const handleConnect = async () => {
    if (!user?.id) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await addConnection(user.id, family.id);
      setConnectionStatus("pending");
      setIsReceiver(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error connecting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!connectionId) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateConnectionStatus(connectionId, "connected");
      setConnectionStatus("connected");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error accepting connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!connectionId) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await updateConnectionStatus(connectionId, "rejected");
      setConnectionStatus(null);
      setConnectionId(null);
      setIsReceiver(false);
    } catch (error) {
      console.error("Error declining connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const thread = await getOrCreateThread(user.id, family.id);
      if (thread) {
        navigation.navigate("Chat", {
          threadId: thread.id,
          family: { id: family.id, familyName: family.familyName, avatarUrl: family.avatarUrl } as any,
        });
      }
    } catch (error) {
      console.error("Error starting message:", error);
    }
  };

  const handleBlock = async () => {
    if (!user?.id) return;
    
    setMenuVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const success = await blockUser(user.id, family.id);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    }
  };

  const handleReport = () => {
    setMenuVisible(false);
    setReportModalVisible(true);
  };

  const submitReport = async () => {
    if (!user?.id || !selectedReason) return;
    
    setSubmitting(true);
    try {
      const success = await reportUser(user.id, family.id, selectedReason, reportDetails);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setReportModalVisible(false);
        setSelectedReason("");
        setReportDetails("");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openPhotoViewer = (index: number, includeAvatar: boolean) => {
    const viewerPhotos: { uri: string }[] = [];
    if (includeAvatar && family.avatarUrl) {
      viewerPhotos.push({ uri: family.avatarUrl.startsWith("/uploads/") ? `${getApiUrl()}${family.avatarUrl}` : family.avatarUrl });
    }
    for (const photo of familyPhotos) {
      viewerPhotos.push({ uri: getPhotoUri(photo.photoUrl) });
    }
    setAllViewerPhotos(viewerPhotos);
    setPhotoViewerIndex(index);
    setPhotoViewerVisible(true);
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
          <Avatar uri={family.avatarUrl} size="xlarge" onPress={family.avatarUrl ? () => openPhotoViewer(0, true) : undefined} />
          <ThemedText type="h3" style={styles.familyName}>
            {family.familyName}
          </ThemedText>
          
          {family.suburb || family.city ? (
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText
                type="body"
                style={[styles.metaText, { color: theme.textSecondary }]}
              >
                {family.suburb || ""}{family.city ? `${family.suburb ? ", " : ""}${family.city}` : ""}
              </ThemedText>
            </View>
          ) : null}
          
          {family.distance !== undefined ? (
            <View style={[styles.distanceBadge, { backgroundColor: theme.secondary + "15" }]}>
              <ThemedText type="caption" style={{ color: theme.secondary }}>
                {family.distance < 1 ? "< 1" : family.distance} km away
              </ThemedText>
            </View>
          ) : null}
        </View>

        {familyPhotos.length > 0 ? (
          <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Family Photos
            </ThemedText>
            <View style={styles.photoGrid}>
              {familyPhotos.map((photo, index) => (
                <Pressable
                  key={photo.id}
                  style={styles.photoItem}
                  onPress={() => openPhotoViewer(family.avatarUrl ? index + 1 : index, !!family.avatarUrl)}
                >
                  <Image
                    source={{ uri: getPhotoUri(photo.photoUrl) }}
                    style={styles.photoImage}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

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

        {family.interests && family.interests.length > 0 ? (
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
            <Button variant="secondary" style={styles.messageButton} onPress={handleMessage}>
              Send Message
            </Button>
          </View>
        ) : connectionStatus === "pending" && isReceiver ? (
          <View style={[styles.connectedSection, { backgroundColor: theme.primary + "10" }]}>
            <Feather name="user-plus" size={24} color={theme.primary} />
            <ThemedText type="body" style={[styles.connectedText, { color: theme.primary }]}>
              This family wants to connect with you!
            </ThemedText>
            <View style={styles.acceptDeclineRow}>
              <Button
                variant="outline"
                onPress={handleDecline}
                loading={loading}
                style={styles.declineButton}
              >
                Decline
              </Button>
              <Button
                onPress={handleAccept}
                loading={loading}
                size="large"
                style={styles.acceptButton}
              >
                Accept
              </Button>
            </View>
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

        <Pressable
          style={[styles.moreButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => setMenuVisible(true)}
        >
          <Feather name="more-horizontal" size={20} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
            More options
          </ThemedText>
        </Pressable>
      </ScrollView>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="heading" style={styles.menuTitle}>
              Options
            </ThemedText>
            
            <Pressable style={styles.menuItem} onPress={handleReport}>
              <Feather name="flag" size={20} color="#F59E0B" />
              <ThemedText type="body" style={[styles.menuItemText, { color: "#F59E0B" }]}>
                Report this family
              </ThemedText>
            </Pressable>
            
            <Pressable style={styles.menuItem} onPress={handleBlock}>
              <Feather name="slash" size={20} color={theme.error} />
              <ThemedText type="body" style={[styles.menuItemText, { color: theme.error }]}>
                Block this family
              </ThemedText>
            </Pressable>
            
            <Pressable
              style={[styles.menuItem, styles.cancelItem, { borderTopColor: theme.border }]}
              onPress={() => setMenuVisible(false)}
            >
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Cancel
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setReportModalVisible(false)}
        >
          <Pressable
            style={[styles.reportModal, { backgroundColor: theme.backgroundDefault }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.reportHeader}>
              <ThemedText type="h3">Report Family</ThemedText>
              <Pressable onPress={() => setReportModalVisible(false)}>
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              Select a reason for reporting this family. Your report will be reviewed by our team.
            </ThemedText>

            <View style={styles.reasonsContainer}>
              {REPORT_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  style={[
                    styles.reasonOption,
                    { 
                      borderColor: selectedReason === reason ? theme.primary : theme.border,
                      backgroundColor: selectedReason === reason ? theme.primary + "10" : "transparent",
                    },
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: selectedReason === reason ? theme.primary : theme.border },
                    ]}
                  >
                    {selectedReason === reason ? (
                      <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                    ) : null}
                  </View>
                  <ThemedText type="body">{reason}</ThemedText>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[
                styles.detailsInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Additional details (optional)"
              placeholderTextColor={theme.textSecondary}
              value={reportDetails}
              onChangeText={setReportDetails}
              multiline
              numberOfLines={3}
            />

            <Button
              onPress={submitReport}
              loading={submitting}
              disabled={!selectedReason}
              size="large"
              style={styles.submitButton}
            >
              Submit Report
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

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
            {family.familyName} {allViewerPhotos.length > 1 ? `(${photoViewerIndex + 1}/${allViewerPhotos.length})` : ""}
          </ThemedText>
          <View style={styles.photoViewerContent}>
            {allViewerPhotos[photoViewerIndex] ? (
              <Image
                source={{ uri: allViewerPhotos[photoViewerIndex].uri }}
                style={styles.photoViewerImage}
                contentFit="contain"
              />
            ) : null}
          </View>
          {allViewerPhotos.length > 1 ? (
            <View style={styles.photoViewerNav}>
              {photoViewerIndex > 0 ? (
                <Pressable
                  style={styles.navButton}
                  onPress={() => setPhotoViewerIndex((i) => i - 1)}
                >
                  <Feather name="chevron-left" size={32} color="#FFFFFF" />
                </Pressable>
              ) : (
                <View style={styles.navButton} />
              )}
              {photoViewerIndex < allViewerPhotos.length - 1 ? (
                <Pressable
                  style={styles.navButton}
                  onPress={() => setPhotoViewerIndex((i) => i + 1)}
                >
                  <Feather name="chevron-right" size={32} color="#FFFFFF" />
                </Pressable>
              ) : (
                <View style={styles.navButton} />
              )}
            </View>
          ) : null}
          <Pressable
            style={styles.photoViewerBackground}
            onPress={() => setPhotoViewerVisible(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  acceptDeclineRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
    width: "100%",
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing["3xl"],
  },
  menuTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  menuItemText: {
    marginLeft: Spacing.md,
  },
  cancelItem: {
    justifyContent: "center",
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.lg,
  },
  reportModal: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    maxHeight: "80%",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  reasonsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailsInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 80,
    textAlignVertical: "top",
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.md,
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
