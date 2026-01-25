import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Avatar } from "@/components/Avatar";
import { InterestTag } from "@/components/InterestTag";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useAuth, Kid } from "@/context/AuthContext";
import { INTERESTS_OPTIONS } from "@/lib/storage";
import { showImagePickerOptions, launchCamera, launchImageLibrary } from "@/lib/imagePicker";

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();

  const [familyName, setFamilyName] = useState(user?.familyName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl || null);
  const [kids, setKids] = useState<Kid[]>(user?.kids || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests || []
  );
  const [loading, setLoading] = useState(false);

  const handleAvatarPress = () => {
    showImagePickerOptions(
      async () => {
        const result = await launchCamera();
        if (result) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setAvatarUri(result.uri);
        }
      },
      async () => {
        const result = await launchImageLibrary();
        if (result) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setAvatarUri(result.uri);
        }
      }
    );
  };

  const addKid = () => {
    setKids([...kids, { id: Date.now().toString(), name: "", age: 0 }]);
  };

  const updateKid = (id: string, field: "name" | "age", value: string | number) => {
    setKids(
      kids.map((kid) =>
        kid.id === id ? { ...kid, [field]: value } : kid
      )
    );
  };

  const removeKid = (id: string) => {
    setKids(kids.filter((kid) => kid.id !== id));
  };

  const toggleInterest = (interest: string) => {
    Haptics.selectionAsync();
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        familyName,
        bio,
        avatarUrl: avatarUri || undefined,
        kids: kids.filter((k) => k.name.trim()),
        interests: selectedInterests,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.avatarSection}>
          <Avatar uri={avatarUri} size="xlarge" showEditBadge onPress={handleAvatarPress} />
          <ThemedText
            type="caption"
            style={[styles.avatarHint, { color: theme.textSecondary }]}
          >
            Tap to change photo
          </ThemedText>
        </View>

        <Input
          label="Family Name"
          placeholder="e.g., The Van der Merwe Family"
          value={familyName}
          onChangeText={setFamilyName}
        />

        <Input
          label="Bio"
          placeholder="Tell other SA families about yourselves..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          maxLength={300}
        />

        <ThemedText type="heading" style={styles.sectionTitle}>
          Your Kids
        </ThemedText>

        {kids.map((kid) => (
          <View
            key={kid.id}
            style={[styles.kidRow, { borderColor: theme.border }]}
          >
            <View style={styles.kidInputs}>
              <View style={styles.kidNameInput}>
                <Input
                  label="Name"
                  placeholder="Child's name"
                  value={kid.name}
                  onChangeText={(text) => updateKid(kid.id, "name", text)}
                />
              </View>
              <View style={styles.kidAgeInput}>
                <Input
                  label="Age"
                  placeholder="0"
                  value={kid.age ? String(kid.age) : ""}
                  onChangeText={(text) =>
                    updateKid(kid.id, "age", parseInt(text) || 0)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Pressable
              onPress={() => removeKid(kid.id)}
              style={[styles.removeKid, { backgroundColor: theme.error + "15" }]}
            >
              <Feather name="x" size={18} color={theme.error} />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={addKid}
          style={[styles.addKidButton, { borderColor: theme.border }]}
        >
          <Feather name="plus" size={20} color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.primary, marginLeft: Spacing.sm }}>
            Add a Child
          </ThemedText>
        </Pressable>

        <ThemedText type="heading" style={styles.sectionTitle}>
          Interests
        </ThemedText>

        <View style={styles.interestsGrid}>
          {INTERESTS_OPTIONS.map((interest) => (
            <InterestTag
              key={interest}
              label={interest}
              selected={selectedInterests.includes(interest)}
              onPress={() => toggleInterest(interest)}
            />
          ))}
        </View>

        <Button
          onPress={handleSave}
          loading={loading}
          style={styles.button}
          size="large"
        >
          Save Changes
        </Button>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatarHint: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  kidRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  kidInputs: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.md,
  },
  kidNameInput: {
    flex: 2,
  },
  kidAgeInput: {
    flex: 1,
  },
  removeKid: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["3xl"],
    marginLeft: Spacing.sm,
  },
  addKidButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginBottom: Spacing["3xl"],
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing["3xl"],
  },
  button: {
    marginBottom: Spacing.md,
  },
});
