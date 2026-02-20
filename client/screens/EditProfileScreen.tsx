import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, ActivityIndicator, Platform, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Avatar } from "@/components/Avatar";
import { InterestTag } from "@/components/InterestTag";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
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
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(user?.familyMembers || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests || []
  );
  const [loading, setLoading] = useState(false);
  const [customInterest, setCustomInterest] = useState("");
  const [suburb, setSuburb] = useState(user?.location?.suburb || "");
  const [city, setCity] = useState(user?.location?.city || "");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationUpdated, setLocationUpdated] = useState(false);

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

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        const detectedSuburb = address?.subregion || address?.district || "";
        const detectedCity = address?.city || "";
        setSuburb(detectedSuburb);
        setCity(detectedCity);
        setLocationUpdated(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (!canAskAgain && Platform.OS !== "web") {
        try {
          await Linking.openSettings();
        } catch {}
      }
    } catch (error) {
      console.error("Location detection error:", error);
    } finally {
      setDetectingLocation(false);
    }
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: any = {
        familyName,
        bio,
        avatarUrl: avatarBase64 || (avatarUri && !avatarUri.startsWith("file://") ? avatarUri : undefined),
        familyMembers: familyMembers.filter((m) => m.name.trim()),
        interests: selectedInterests,
      };

      const suburbChanged = suburb !== (user?.location?.suburb || "");
      const cityChanged = city !== (user?.location?.city || "");
      if (suburbChanged || cityChanged || locationUpdated) {
        updates.location = {
          suburb: suburb.trim(),
          city: city.trim(),
          lat: user?.location?.lat || 0,
          lon: user?.location?.lon || 0,
          radiusPreference: user?.location?.radiusPreference || 25,
        };
      }

      await updateProfile(updates);
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
          maxLength={500}
        />
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginTop: -Spacing.md, marginBottom: Spacing.lg, fontStyle: "italic" }}
        >
          Please avoid sharing personal details and sensitive information such as bank details.
        </ThemedText>

        <ThemedText type="heading" style={styles.sectionTitle}>
          Location
        </ThemedText>
        <ThemedText
          type="caption"
          style={[styles.sectionHint, { color: theme.textSecondary }]}
        >
          Set where you live so nearby families can find you
        </ThemedText>

        <View style={[styles.locationSection, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
          <View style={styles.locationInputs}>
            <Input
              label="Suburb / Area"
              placeholder="e.g., Howick"
              value={suburb}
              onChangeText={(text) => { setSuburb(text); setLocationUpdated(true); }}
              testID="input-suburb"
            />
            <Input
              label="City"
              placeholder="e.g., Auckland"
              value={city}
              onChangeText={(text) => { setCity(text); setLocationUpdated(true); }}
              testID="input-city"
            />
          </View>

          <Pressable
            style={[styles.detectButton, { backgroundColor: theme.primary + "10", borderColor: theme.primary }]}
            onPress={handleDetectLocation}
            disabled={detectingLocation}
            testID="button-detect-location"
          >
            {detectingLocation ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Feather name="crosshair" size={18} color={theme.primary} />
            )}
            <ThemedText type="body" style={{ color: theme.primary, marginLeft: Spacing.sm, fontWeight: "500" }}>
              {detectingLocation ? "Detecting..." : "Use my current location"}
            </ThemedText>
          </Pressable>
        </View>

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
  locationSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["3xl"],
  },
  locationInputs: {
    gap: Spacing.xs,
  },
  detectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
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
});
