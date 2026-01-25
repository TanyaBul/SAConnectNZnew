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
import { useAuth, FamilyMember } from "@/context/AuthContext";
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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(user?.familyMembers || []);
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

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { id: Date.now().toString(), name: "", age: 0 }]);
  };

  const updateFamilyMember = (id: string, field: "name" | "age", value: string | number) => {
    setFamilyMembers(
      familyMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((member) => member.id !== id));
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
        familyMembers: familyMembers.filter((m) => m.name.trim()),
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
          Family Members
        </ThemedText>
        <ThemedText
          type="caption"
          style={[styles.sectionHint, { color: theme.textSecondary }]}
        >
          Optional - add names and ages (e.g., John 40)
        </ThemedText>

        {familyMembers.map((member) => (
          <View
            key={member.id}
            style={[styles.memberRow, { borderColor: theme.border }]}
          >
            <View style={styles.memberInputs}>
              <View style={styles.memberNameInput}>
                <Input
                  label="Name"
                  placeholder="e.g., John"
                  value={member.name}
                  onChangeText={(text) => updateFamilyMember(member.id, "name", text)}
                />
              </View>
              <View style={styles.memberAgeInput}>
                <Input
                  label="Age"
                  placeholder="0"
                  value={member.age ? String(member.age) : ""}
                  onChangeText={(text) =>
                    updateFamilyMember(member.id, "age", parseInt(text) || 0)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Pressable
              onPress={() => removeFamilyMember(member.id)}
              style={[styles.removeMember, { backgroundColor: theme.error + "15" }]}
            >
              <Feather name="x" size={18} color={theme.error} />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={addFamilyMember}
          style={[styles.addMemberButton, { borderColor: theme.border }]}
        >
          <Feather name="plus" size={20} color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.primary, marginLeft: Spacing.sm }}>
            Add Family Member
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
    marginBottom: Spacing.sm,
  },
  sectionHint: {
    marginBottom: Spacing.lg,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  memberInputs: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.md,
  },
  memberNameInput: {
    flex: 2,
  },
  memberAgeInput: {
    flex: 1,
  },
  removeMember: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["3xl"],
    marginLeft: Spacing.sm,
  },
  addMemberButton: {
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
