import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { showImagePickerOptions, launchCamera, launchImageLibrary } from "@/lib/imagePicker";

export default function CreateProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { user, updateProfile } = useAuth();

  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(user?.familyMembers || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests || []
  );
  const [loading, setLoading] = useState(false);
  const [customInterest, setCustomInterest] = useState("");

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (!trimmed) return;
    if (selectedInterests.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setCustomInterest("");
      return;
    }
    Haptics.selectionAsync();
    setSelectedInterests([...selectedInterests, trimmed]);
    setCustomInterest("");
  };

  const handleAvatarPress = () => {
    showImagePickerOptions(
      async () => {
        const result = await launchCamera();
        if (result) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setAvatarUri(result.uri);
          setAvatarBase64(result.base64 || null);
        }
      },
      async () => {
        const result = await launchImageLibrary();
        if (result) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setAvatarUri(result.uri);
          setAvatarBase64(result.base64 || null);
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

  const handleContinue = async () => {
    setLoading(true);
    try {
      await updateProfile({
        bio,
        avatarUrl: avatarBase64 || avatarUri || undefined,
        familyMembers: familyMembers.filter((m) => m.name.trim()),
        interests: selectedInterests,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("LocationPermission");
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
            Tap to add a family photo
          </ThemedText>
        </View>

        <ThemedText type="heading" style={styles.sectionTitle}>
          About Your Family
        </ThemedText>
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
        <View style={[styles.disclaimer, { backgroundColor: "#F59E0B15", borderColor: "#F59E0B" }]}>
          <Feather name="shield" size={16} color="#F59E0B" style={styles.disclaimerIcon} />
          <ThemedText type="small" style={{ color: theme.text, flex: 1 }}>
            For children's safety, only first names will be visible to other families. Never share full names, school details, or other identifying information about minors.
          </ThemedText>
        </View>

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
        <ThemedText
          type="caption"
          style={[styles.sectionHint, { color: theme.textSecondary }]}
        >
          Select what your family enjoys
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

        {selectedInterests.filter((i) => !INTERESTS_OPTIONS.includes(i)).length > 0 ? (
          <View style={styles.customInterestsSection}>
            <ThemedText type="caption" style={[styles.customLabel, { color: theme.textSecondary }]}>
              Your custom interests
            </ThemedText>
            <View style={styles.interestsGrid}>
              {selectedInterests
                .filter((i) => !INTERESTS_OPTIONS.includes(i))
                .map((interest) => (
                  <InterestTag
                    key={interest}
                    label={interest}
                    selected
                    showRemove
                    onPress={() => toggleInterest(interest)}
                  />
                ))}
            </View>
          </View>
        ) : null}

        <View style={[styles.addInterestRow, { borderColor: theme.border }]}>
          <TextInput
            style={[styles.addInterestInput, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            value={customInterest}
            onChangeText={setCustomInterest}
            placeholder="Add your own interest..."
            placeholderTextColor={theme.textSecondary}
            onSubmitEditing={addCustomInterest}
            returnKeyType="done"
            testID="input-custom-interest"
          />
          <Pressable
            style={[styles.addInterestButton, { backgroundColor: customInterest.trim() ? theme.primary : theme.backgroundSecondary }]}
            onPress={addCustomInterest}
            disabled={!customInterest.trim()}
            testID="button-add-interest"
          >
            <Feather name="plus" size={20} color={customInterest.trim() ? "#FFFFFF" : theme.textSecondary} />
          </Pressable>
        </View>

        <Button
          onPress={handleContinue}
          loading={loading}
          style={styles.button}
          size="large"
        >
          Continue
        </Button>

        <Button
          onPress={() => navigation.navigate("LocationPermission")}
          variant="ghost"
        >
          Skip for now
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
    marginBottom: Spacing.lg,
  },
  customInterestsSection: {
    marginBottom: Spacing.lg,
  },
  customLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addInterestRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing["3xl"],
  },
  addInterestInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  addInterestButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginBottom: Spacing.md,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  disclaimerIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
});
