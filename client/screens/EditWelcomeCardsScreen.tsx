import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  ScrollView,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface WelcomeCardData {
  id: string;
  sortOrder: number;
  icon: string;
  header: string;
  title: string;
  bullets: string[];
  accentColor: string;
  borderColor: string;
  promoText: string;
  imageUrl: string | null;
  active: boolean;
}

const ICON_OPTIONS = [
  "heart", "calendar", "message-circle", "star", "gift", "award",
  "sun", "coffee", "music", "map-pin", "users", "globe",
];

const COLOR_OPTIONS = [
  "#E8703A", "#1A7F7F", "#F5A623", "#DC2626", "#7C3AED",
  "#2563EB", "#16A34A", "#EC4899", "#0891B2", "#84CC16",
];

export default function EditWelcomeCardsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [cards, setCards] = useState<WelcomeCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingCard, setEditingCard] = useState<WelcomeCardData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formHeader, setFormHeader] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBullets, setFormBullets] = useState(["", "", ""]);
  const [formIcon, setFormIcon] = useState("heart");
  const [formAccentColor, setFormAccentColor] = useState("#E8703A");
  const [formPromoText, setFormPromoText] = useState("Watch this space for special promotions and events");
  const [formImageBase64, setFormImageBase64] = useState<string | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formActive, setFormActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(0);

  const loadCards = useCallback(async () => {
    try {
      const headers: any = { "x-user-email": user?.email || "" };
      const response = await fetch(
        new URL("/api/admin/welcome-cards", getApiUrl()).toString(),
        { headers }
      );
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  const resetForm = () => {
    setFormHeader("");
    setFormTitle("");
    setFormBullets(["", "", ""]);
    setFormIcon("heart");
    setFormAccentColor("#E8703A");
    setFormPromoText("Watch this space for special promotions and events");
    setFormImageBase64(null);
    setFormImagePreview(null);
    setFormActive(true);
    setFormSortOrder(cards.length);
  };

  const startEditing = (card: WelcomeCardData) => {
    setEditingCard(card);
    setIsCreating(false);
    setFormHeader(card.header);
    setFormTitle(card.title);
    const bullets = [...(card.bullets || [])];
    while (bullets.length < 3) bullets.push("");
    setFormBullets(bullets);
    setFormIcon(card.icon);
    setFormAccentColor(card.accentColor);
    setFormPromoText(card.promoText);
    setFormImageBase64(null);
    setFormImagePreview(card.imageUrl);
    setFormActive(card.active);
    setFormSortOrder(card.sortOrder);
  };

  const startCreating = () => {
    resetForm();
    setEditingCard(null);
    setIsCreating(true);
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setIsCreating(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFormImagePreview(asset.uri);

      if (Platform.OS === "web") {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormImageBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } else {
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        setFormImageBase64(`data:${mimeType};base64,${base64}`);
      }
    }
  };

  const saveCard = async () => {
    if (!formHeader.trim() || !formTitle.trim()) {
      Alert.alert("Missing Fields", "Header and title are required.");
      return;
    }

    const filteredBullets = formBullets.filter((b) => b.trim());
    if (filteredBullets.length === 0) {
      Alert.alert("Missing Fields", "At least one bullet point is required.");
      return;
    }

    setSaving(true);
    try {
      const body: any = {
        header: formHeader.trim(),
        title: formTitle.trim(),
        bullets: filteredBullets,
        icon: formIcon,
        accentColor: formAccentColor,
        borderColor: formAccentColor,
        promoText: formPromoText.trim(),
        sortOrder: formSortOrder,
        active: formActive,
      };

      if (formImageBase64) {
        body.imageBase64 = formImageBase64;
      }

      const url = editingCard
        ? new URL(`/api/admin/welcome-cards/${editingCard.id}`, getApiUrl()).toString()
        : new URL("/api/admin/welcome-cards", getApiUrl()).toString();

      const response = await fetch(url, {
        method: editingCard ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setEditingCard(null);
        setIsCreating(false);
        loadCards();
      } else {
        const err = await response.json();
        Alert.alert("Error", err.error || "Failed to save card");
      }
    } catch (error) {
      console.error("Save card error:", error);
      Alert.alert("Error", "Failed to save card");
    } finally {
      setSaving(false);
    }
  };

  const deleteCard = (card: WelcomeCardData) => {
    Alert.alert(
      "Delete Card",
      `Are you sure you want to delete "${card.header}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                new URL(`/api/admin/welcome-cards/${card.id}`, getApiUrl()).toString(),
                {
                  method: "DELETE",
                  headers: { "x-user-email": user?.email || "" },
                }
              );
              if (response.ok) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                loadCards();
              }
            } catch (error) {
              console.error("Delete card error:", error);
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (card: WelcomeCardData) => {
    try {
      const response = await fetch(
        new URL(`/api/admin/welcome-cards/${card.id}`, getApiUrl()).toString(),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user?.email || "",
          },
          body: JSON.stringify({ active: !card.active }),
        }
      );
      if (response.ok) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, active: !c.active } : c))
        );
      }
    } catch (error) {
      console.error("Toggle active error:", error);
    }
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...formBullets];
    newBullets[index] = value;
    setFormBullets(newBullets);
  };

  const addBullet = () => {
    setFormBullets([...formBullets, ""]);
  };

  const removeBullet = (index: number) => {
    if (formBullets.length <= 1) return;
    setFormBullets(formBullets.filter((_, i) => i !== index));
  };

  if (editingCard || isCreating) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.formContent,
            { paddingBottom: insets.bottom + Spacing["3xl"] },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formHeader}>
            <ThemedText type="heading">
              {editingCard ? "Edit Card" : "New Card"}
            </ThemedText>
            <Pressable onPress={cancelEditing} testID="button-cancel-edit">
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              Header
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              value={formHeader}
              onChangeText={setFormHeader}
              placeholder="e.g. Welcome Back"
              placeholderTextColor={theme.textSecondary}
              testID="input-card-header"
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              Title
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="e.g. Connect with Families"
              placeholderTextColor={theme.textSecondary}
              testID="input-card-title"
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              Bullet Points
            </ThemedText>
            {formBullets.map((bullet, index) => (
              <View key={`bullet-${index}`} style={styles.bulletInputRow}>
                <TextInput
                  style={[styles.bulletInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  value={bullet}
                  onChangeText={(val) => updateBullet(index, val)}
                  placeholder={`Bullet point ${index + 1}`}
                  placeholderTextColor={theme.textSecondary}
                  testID={`input-bullet-${index}`}
                />
                <Pressable
                  style={[styles.bulletRemove, { backgroundColor: theme.error + "15" }]}
                  onPress={() => removeBullet(index)}
                >
                  <Feather name="minus" size={16} color={theme.error} />
                </Pressable>
              </View>
            ))}
            <Pressable
              style={[styles.addBulletButton, { borderColor: theme.border }]}
              onPress={addBullet}
            >
              <Feather name="plus" size={16} color={theme.primary} />
              <ThemedText type="caption" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
                Add bullet point
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              Promotional Text
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              value={formPromoText}
              onChangeText={setFormPromoText}
              placeholder="Promotional message"
              placeholderTextColor={theme.textSecondary}
              multiline
              testID="input-promo-text"
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              Icon
            </ThemedText>
            <View style={styles.optionsRow}>
              {ICON_OPTIONS.map((iconName) => (
                <Pressable
                  key={iconName}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: formIcon === iconName ? formAccentColor + "20" : theme.backgroundSecondary,
                      borderColor: formIcon === iconName ? formAccentColor : theme.border,
                    },
                  ]}
                  onPress={() => setFormIcon(iconName)}
                >
                  <Feather
                    name={iconName as any}
                    size={20}
                    color={formIcon === iconName ? formAccentColor : theme.textSecondary}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              Accent Colour
            </ThemedText>
            <View style={styles.optionsRow}>
              {COLOR_OPTIONS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    formAccentColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setFormAccentColor(color)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              Card Photo
            </ThemedText>
            {formImagePreview ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: formImagePreview.startsWith("/") ? new URL(formImagePreview, getApiUrl()).toString() : formImagePreview }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imageActions}>
                  <Pressable
                    style={[styles.imageActionButton, { backgroundColor: theme.primary + "15" }]}
                    onPress={pickImage}
                  >
                    <Feather name="edit-2" size={16} color={theme.primary} />
                    <ThemedText type="caption" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
                      Change
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.imageActionButton, { backgroundColor: theme.error + "15" }]}
                    onPress={() => { setFormImagePreview(null); setFormImageBase64(null); }}
                  >
                    <Feather name="trash-2" size={16} color={theme.error} />
                    <ThemedText type="caption" style={{ color: theme.error, marginLeft: Spacing.xs }}>
                      Remove
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={[styles.uploadButton, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
                onPress={pickImage}
                testID="button-upload-image"
              >
                <Feather name="image" size={32} color={theme.textSecondary} />
                <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                  Tap to upload a photo
                </ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.switchRow}>
              <ThemedText type="body">Active</ThemedText>
              <Pressable
                style={[
                  styles.toggle,
                  { backgroundColor: formActive ? theme.success : theme.textSecondary + "30" },
                ]}
                onPress={() => setFormActive(!formActive)}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    formActive && styles.toggleKnobActive,
                  ]}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              Sort Order
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, width: 80 }]}
              value={String(formSortOrder)}
              onChangeText={(val) => setFormSortOrder(parseInt(val) || 0)}
              keyboardType="numeric"
              testID="input-sort-order"
            />
          </View>

          <View style={[styles.previewCard, { backgroundColor: theme.backgroundDefault, borderColor: formAccentColor + "50" }]}>
            <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
              Preview
            </ThemedText>
            {formImagePreview ? (
              <Image
                source={{ uri: formImagePreview.startsWith("/") ? new URL(formImagePreview, getApiUrl()).toString() : formImagePreview }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : null}
            <View style={[styles.previewBadge, { backgroundColor: formAccentColor + "15" }]}>
              <Feather name={formIcon as any} size={14} color={formAccentColor} />
              <ThemedText type="small" style={{ color: formAccentColor, fontWeight: "600", marginLeft: 4 }}>
                {formHeader || "Header"}
              </ThemedText>
            </View>
            <ThemedText type="heading" style={{ marginTop: Spacing.sm }}>
              {formTitle || "Title"}
            </ThemedText>
            {formBullets.filter((b) => b.trim()).map((b, i) => (
              <View key={`preview-${i}`} style={styles.previewBullet}>
                <View style={[styles.previewDot, { backgroundColor: formAccentColor }]} />
                <ThemedText type="caption" style={{ flex: 1 }}>{b}</ThemedText>
              </View>
            ))}
            {formPromoText.trim() ? (
              <View style={[styles.previewPromo, { backgroundColor: formAccentColor }]}>
                <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "700", textAlign: "center" }}>
                  {formPromoText}
                </ThemedText>
              </View>
            ) : null}
          </View>

          <Pressable
            style={[styles.saveButton, { backgroundColor: theme.primary, opacity: saving ? 0.6 : 1 }]}
            onPress={saveCard}
            disabled={saving}
            testID="button-save-card"
          >
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
              {saving ? "Saving..." : editingCard ? "Update Card" : "Create Card"}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </ThemedView>
    );
  }

  const renderCard = ({ item }: { item: WelcomeCardData }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          borderLeftColor: item.accentColor,
          borderLeftWidth: 4,
          opacity: item.active ? 1 : 0.5,
          ...Shadows.card,
        },
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeaderRow}>
            <Feather name={item.icon as any} size={16} color={item.accentColor} />
            <ThemedText type="caption" style={{ color: item.accentColor, fontWeight: "600", marginLeft: Spacing.xs }}>
              {item.header}
            </ThemedText>
          </View>
          <ThemedText type="heading" style={{ marginTop: Spacing.xs }}>
            {item.title}
          </ThemedText>
        </View>
        {item.imageUrl ? (
          <Image
            source={{ uri: new URL(item.imageUrl, getApiUrl()).toString() }}
            style={styles.cardThumb}
            resizeMode="cover"
          />
        ) : null}
      </View>

      <View style={styles.cardBullets}>
        {(item.bullets || []).map((bullet, idx) => (
          <ThemedText key={`${item.id}-b-${idx}`} type="caption" style={{ color: theme.textSecondary }}>
            {"\u2022 "}{bullet}
          </ThemedText>
        ))}
      </View>

      {item.promoText ? (
        <View style={[styles.cardPromo, { backgroundColor: item.accentColor + "15" }]}>
          <ThemedText type="small" style={{ color: item.accentColor, fontWeight: "600" }}>
            {item.promoText}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <Pressable
          style={[styles.cardAction, { backgroundColor: theme.primary + "10" }]}
          onPress={() => startEditing(item)}
          testID={`button-edit-card-${item.id}`}
        >
          <Feather name="edit-2" size={16} color={theme.primary} />
          <ThemedText type="small" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
            Edit
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.cardAction, { backgroundColor: item.active ? theme.success + "10" : theme.textSecondary + "10" }]}
          onPress={() => toggleActive(item)}
        >
          <Feather name={item.active ? "eye" : "eye-off"} size={16} color={item.active ? theme.success : theme.textSecondary} />
          <ThemedText type="small" style={{ color: item.active ? theme.success : theme.textSecondary, marginLeft: Spacing.xs }}>
            {item.active ? "Active" : "Inactive"}
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.cardAction, { backgroundColor: theme.error + "10" }]}
          onPress={() => deleteCard(item)}
        >
          <Feather name="trash-2" size={16} color={theme.error} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCards(); }} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="layers" size={48} color={theme.textSecondary} />
            <ThemedText type="heading" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
              No Welcome Cards
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
              Create your first welcome card to show users when they sign in.
            </ThemedText>
          </View>
        }
      />

      <Pressable
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={startCreating}
        testID="button-create-card"
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardThumb: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.md,
  },
  cardBullets: {
    marginTop: Spacing.sm,
    gap: 2,
  },
  cardPromo: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg + 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  formContent: {
    padding: Spacing.lg,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  fieldGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  bulletInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  bulletInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  bulletRemove: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  addBulletButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 2,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreviewContainer: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.lg,
  },
  imageActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  imageActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    padding: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  previewCard: {
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  previewImage: {
    width: "100%",
    height: 120,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  previewBullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 4,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewPromo: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  saveButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
