import { Platform, Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

export interface ImagePickerResult {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }
  
  const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status === "granted") {
    return true;
  }
  
  if (!canAskAgain) {
    Alert.alert(
      "Camera Access Required",
      "To take photos, please enable camera access in your device settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: async () => {
            try {
              await Linking.openSettings();
            } catch (error) {
              // Settings not available
            }
          },
        },
      ]
    );
  }
  
  return false;
}

async function requestMediaLibraryPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }
  
  const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status === "granted") {
    return true;
  }
  
  if (!canAskAgain) {
    Alert.alert(
      "Photo Library Access Required",
      "To select photos, please enable photo library access in your device settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: async () => {
            try {
              await Linking.openSettings();
            } catch (error) {
              // Settings not available
            }
          },
        },
      ]
    );
  }
  
  return false;
}

export async function launchCamera(): Promise<ImagePickerResult | null> {
  const hasPermission = await requestCameraPermission();
  
  if (!hasPermission) {
    return null;
  }
  
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    
    if (result.canceled || !result.assets[0]) {
      return null;
    }
    
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.log("Camera not available:", error);
    return null;
  }
}

export async function launchImageLibrary(): Promise<ImagePickerResult | null> {
  const hasPermission = await requestMediaLibraryPermission();
  
  if (!hasPermission) {
    return null;
  }
  
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });
  
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined,
    width: asset.width,
    height: asset.height,
  };
}

export function showImagePickerOptions(
  onCameraSelect: () => void,
  onGallerySelect: () => void
): void {
  if (Platform.OS === "web") {
    onGallerySelect();
    return;
  }
  
  Alert.alert(
    "Add Photo",
    "Choose how to add a profile photo",
    [
      { text: "Take Photo", onPress: onCameraSelect },
      { text: "Choose from Library", onPress: onGallerySelect },
      { text: "Cancel", style: "cancel" },
    ]
  );
}
