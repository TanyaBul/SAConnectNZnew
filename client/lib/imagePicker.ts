import { Platform, Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

export interface ImagePickerResult {
  uri: string;
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
      quality: 0.8,
    });
    
    if (result.canceled || !result.assets[0]) {
      return null;
    }
    
    return {
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
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
    quality: 0.8,
  });
  
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  
  return {
    uri: result.assets[0].uri,
    width: result.assets[0].width,
    height: result.assets[0].height,
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
