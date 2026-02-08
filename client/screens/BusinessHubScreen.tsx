import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Pressable, ActivityIndicator, Modal, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { InterestTag } from "@/components/InterestTag";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, Typography } from "@/constants/theme";
import { getBusinesses, createBusiness, formatRelativeTime, Business, BUSINESS_CATEGORIES, getConnections, addConnection, getOrCreateThread, Connection, Family } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";
import { showImagePickerOptions, launchCamera, launchImageLibrary } from "@/lib/imagePicker";

export default function BusinessHubScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food & Baking");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [promotion, setPromotion] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [bizData, connectionsData] = await Promise.all([
        getBusinesses(),
        user?.id ? getConnections(user.id) : Promise.resolve([]),
      ]);
      setBusinesses(bizData);
      setConnections(connectionsData);
    } catch (error) {
      console.error("Error loading businesses:", error);
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

  const filteredBusinesses = selectedCategory
    ? businesses.filter(b => b.category === selectedCategory)
    : businesses;

  const handlePickLogo = () => {
    showImagePickerOptions(
      async () => {
        const result = await launchCamera();
        if (result) {
          const response = await fetch(result.uri);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setLogoUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      },
      async () => {
        const result = await launchImageLibrary();
        if (result) {
          const response = await fetch(result.uri);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setLogoUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("Food & Baking");
    setLocation("");
    setPhone("");
    setEmail("");
    setWebsite("");
    setLogoUrl("");
    setPromotion("");
  };

  const handleAddBusiness = async () => {
    if (!name.trim() || !category) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!user?.id) return;

    setSaving(true);
    try {
      const newBiz = await createBusiness(user.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        location: location.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        logoUrl: logoUrl || undefined,
        promotion: promotion.trim() || undefined,
      });
      if (newBiz) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setBusinesses([{ ...newBiz, user: { id: user.id, familyName: user.familyName, email: user.email } as any }, ...businesses]);
        setModalVisible(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error adding business:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const getConnectionStatus = (userId: string) => {
    const connection = connections.find(
      (c) => c.targetUserId === userId || c.userId === userId
    );
    return connection?.status;
  };

  const handleConnect = async (targetUserId: string) => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const newConnection = await addConnection(user.id, targetUserId);
      if (newConnection) {
        setConnections([...connections, newConnection]);
      }
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  const handleMessage = async (bizUser: Family) => {
    if (!user?.id || !bizUser) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const thread = await getOrCreateThread(user.id, bizUser.id);
      if (thread) {
        navigation.navigate("Chat", { threadId: thread.id, family: bizUser });
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (emailAddr: string) => {
    Linking.openURL(`mailto:${emailAddr}`);
  };

  const handleWebsite = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(fullUrl);
  };

  const getCategoryIcon = (cat: string): string => {
    const icons: Record<string, string> = {
      "Food & Baking": "coffee",
      "Beauty & Wellness": "heart",
      "Home Services": "home",
      "Health & Fitness": "activity",
      "Education & Tutoring": "book-open",
      "Childcare": "smile",
      "Events & Entertainment": "music",
      "Arts & Crafts": "pen-tool",
      "Professional Services": "briefcase",
      "Retail": "shopping-bag",
      "Transport": "truck",
      "Other": "grid",
    };
    return icons[cat] || "grid";
  };

  const resolveLogoUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${getApiUrl()}${url}`;
  };

  const renderBusiness = ({ item }: { item: Business }) => {
    const isExpanded = expandedId === item.id;
    const isOwner = item.userId === user?.id;
    const resolvedLogo = resolveLogoUrl(item.logoUrl);

    return (
      <Pressable
        style={[styles.bizCard, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}
        onPress={() => {
          Haptics.selectionAsync();
          setExpandedId(isExpanded ? null : item.id);
        }}
        testID={`card-business-${item.id}`}
      >
        <View style={styles.bizHeader}>
          {resolvedLogo ? (
            <Image
              source={{ uri: resolvedLogo }}
              style={styles.bizLogo}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.bizLogoPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name={getCategoryIcon(item.category) as any} size={24} color={theme.primary} />
            </View>
          )}
          <View style={styles.bizInfo}>
            <ThemedText type="heading" numberOfLines={1} style={styles.bizName}>
              {item.name}
            </ThemedText>
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary + "15" }]}>
              <ThemedText type="small" style={{ color: theme.primary, fontWeight: "500" }}>
                {item.category}
              </ThemedText>
            </View>
          </View>
        </View>

        {item.promotion ? (
          <View style={[styles.promoBar, { backgroundColor: theme.accent + "15", borderColor: theme.accent + "30" }]}>
            <Feather name="tag" size={14} color={theme.accent || theme.primary} />
            <ThemedText type="small" style={{ color: theme.accent || theme.primary, marginLeft: Spacing.sm, fontWeight: "600", flex: 1 }}>
              {item.promotion}
            </ThemedText>
          </View>
        ) : null}

        {item.description ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm }} numberOfLines={isExpanded ? undefined : 2}>
            {item.description}
          </ThemedText>
        ) : null}

        {item.location ? (
          <View style={[styles.detailRow, { marginTop: Spacing.sm }]}>
            <Feather name="map-pin" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
              {item.location}
            </ThemedText>
          </View>
        ) : null}

        {isExpanded ? (
          <View style={styles.expandedSection}>
            {item.phone ? (
              <Pressable style={styles.detailRow} onPress={() => handleCall(item.phone!)}>
                <Feather name="phone" size={14} color={theme.secondary} />
                <ThemedText type="small" style={{ color: theme.secondary, marginLeft: Spacing.sm }}>
                  {item.phone}
                </ThemedText>
              </Pressable>
            ) : null}
            {item.email ? (
              <Pressable style={styles.detailRow} onPress={() => handleEmail(item.email!)}>
                <Feather name="mail" size={14} color={theme.secondary} />
                <ThemedText type="small" style={{ color: theme.secondary, marginLeft: Spacing.sm }}>
                  {item.email}
                </ThemedText>
              </Pressable>
            ) : null}
            {item.website ? (
              <Pressable style={styles.detailRow} onPress={() => handleWebsite(item.website!)}>
                <Feather name="globe" size={14} color={theme.secondary} />
                <ThemedText type="small" style={{ color: theme.secondary, marginLeft: Spacing.sm }}>
                  {item.website}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.bizFooter, { borderTopColor: theme.border }]}>
          <View style={styles.hostInfo}>
            <Avatar uri={item.user?.avatarUrl} size="small" />
            <ThemedText type="caption" style={{ marginLeft: Spacing.sm }}>
              {item.user?.familyName || "SA Family"}
            </ThemedText>
          </View>
          {!isOwner && item.user ? (
            <View style={styles.bizActions}>
              {getConnectionStatus(item.userId) === "connected" ? (
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.primary + "15" }]}
                  onPress={() => handleMessage(item.user!)}
                >
                  <Feather name="message-circle" size={16} color={theme.primary} />
                  <ThemedText type="small" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
                    Message
                  </ThemedText>
                </Pressable>
              ) : getConnectionStatus(item.userId) === "pending" ? (
                <View style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="clock" size={16} color={theme.textSecondary} />
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                    Pending
                  </ThemedText>
                </View>
              ) : (
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.primary }]}
                  onPress={() => handleConnect(item.userId)}
                >
                  <Feather name="user-plus" size={16} color="#FFFFFF" />
                  <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: Spacing.xs }}>
                    Connect
                  </ThemedText>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.filterRow}>
      <Pressable
        style={[
          styles.filterChip,
          { backgroundColor: !selectedCategory ? theme.primary : theme.backgroundSecondary },
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          setSelectedCategory(null);
        }}
      >
        <ThemedText type="small" style={{ color: !selectedCategory ? "#FFFFFF" : theme.text, fontWeight: "500" }}>
          All
        </ThemedText>
      </Pressable>
      {BUSINESS_CATEGORIES.map((cat) => (
        <Pressable
          key={cat}
          style={[
            styles.filterChip,
            { backgroundColor: selectedCategory === cat ? theme.primary : theme.backgroundSecondary },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setSelectedCategory(selectedCategory === cat ? null : cat);
          }}
        >
          <ThemedText type="small" style={{ color: selectedCategory === cat ? "#FFFFFF" : theme.text, fontWeight: "500" }}>
            {cat}
          </ThemedText>
        </Pressable>
      ))}
    </View>
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
        data={filteredBusinesses}
        keyExtractor={(item) => item.id}
        renderItem={renderBusiness}
        ListHeaderComponent={businesses.length > 0 ? renderCategoryFilter : null}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.lg,
          },
          filteredBusinesses.length === 0 && businesses.length === 0 && styles.emptyList,
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
          businesses.length === 0 ? (
            <EmptyState
              image="community"
              title="No Businesses Yet"
              description="Be the first to list your business for the SA community!"
              actionLabel="Add Your Business"
              onAction={() => setModalVisible(true)}
            />
          ) : (
            <View style={styles.noResults}>
              <Feather name="search" size={48} color={theme.textSecondary} />
              <ThemedText type="heading" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
                No businesses in this category
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                Try a different category or add your own listing
              </ThemedText>
            </View>
          )
        }
      />

      {businesses.length > 0 ? (
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary, ...Shadows.fab }]}
          testID="button-add-business"
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
            <ThemedText type="heading">Add Business</ThemedText>
            <View style={{ width: 50 }} />
          </View>

          <KeyboardAwareScrollViewCompat
            style={styles.modalScroll}
            contentContainerStyle={[styles.modalContent, { paddingBottom: insets.bottom + Spacing.xl }]}
          >
            <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              Free listing for SA families running a business, side hustle, or home enterprise in New Zealand.
            </ThemedText>

            <Pressable
              style={[styles.logoUpload, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
              onPress={handlePickLogo}
            >
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoPreview} contentFit="cover" />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Feather name="camera" size={28} color={theme.textSecondary} />
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                    Add Logo (optional)
                  </ThemedText>
                </View>
              )}
            </Pressable>

            <Input
              label="Business Name"
              placeholder="e.g., Boerewors Rolls by Tannie Elsa"
              value={name}
              onChangeText={setName}
              testID="input-business-name"
            />

            <Input
              label="Description (optional)"
              placeholder="What does your business offer?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              testID="input-business-description"
            />

            <ThemedText type="caption" style={styles.fieldLabel}>Category</ThemedText>
            <View style={styles.categoryGrid}>
              {BUSINESS_CATEGORIES.map((cat) => (
                <InterestTag
                  key={cat}
                  label={cat}
                  selected={category === cat}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(cat);
                  }}
                />
              ))}
            </View>

            <Input
              label="Location (optional)"
              placeholder="e.g., North Shore, Auckland"
              value={location}
              onChangeText={setLocation}
              testID="input-business-location"
            />

            <Input
              label="Phone (optional)"
              placeholder="e.g., 021 123 4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              testID="input-business-phone"
            />

            <Input
              label="Email (optional)"
              placeholder="e.g., hello@mybusiness.co.nz"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="input-business-email"
            />

            <Input
              label="Website (optional)"
              placeholder="e.g., www.mybusiness.co.nz"
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              testID="input-business-website"
            />

            <Input
              label="Current Promotion (optional)"
              placeholder="e.g., 10% off for SA Connect families!"
              value={promotion}
              onChangeText={setPromotion}
              testID="input-business-promotion"
            />

            <Button
              onPress={handleAddBusiness}
              loading={saving}
              size="large"
              style={styles.createButton}
            >
              List My Business
            </Button>
          </KeyboardAwareScrollViewCompat>
        </ThemedView>
      </Modal>
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  bizCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  bizHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  bizLogo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
  },
  bizLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  bizInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  bizName: {
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  promoBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandedSection: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  bizFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bizActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  logoUpload: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
    alignSelf: "center",
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  logoPreview: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  createButton: {
    marginTop: Spacing.lg,
  },
});
