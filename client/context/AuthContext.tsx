import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, getApiUrl } from "@/lib/query-client";

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
}

export interface UserLocation {
  suburb: string;
  city: string;
  lat: number;
  lon: number;
  radiusPreference: number;
}

export interface UserProfile {
  id: string;
  email: string;
  familyName: string;
  bio: string;
  avatarUrl: string | null;
  location: UserLocation | null;
  familyMembers: FamilyMember[];
  interests: string[];
  profileHidden: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  showWelcomeCards: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, familyName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshUser: () => Promise<void>;
  dismissWelcomeCards: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  USER: "@sa_connect_user",
  ONBOARDED: "@sa_connect_onboarded",
};

function transformDbUserToProfile(dbUser: any): UserProfile {
  return {
    id: dbUser.id,
    email: dbUser.email,
    familyName: dbUser.familyName,
    bio: dbUser.bio || "",
    avatarUrl: dbUser.avatarUrl || null,
    location: dbUser.suburb && dbUser.city ? {
      suburb: dbUser.suburb,
      city: dbUser.city,
      lat: dbUser.lat || 0,
      lon: dbUser.lon || 0,
      radiusPreference: dbUser.radiusPreference || 25,
    } : null,
    familyMembers: dbUser.familyMembers || [],
    interests: dbUser.interests || [],
    profileHidden: dbUser.profileHidden || false,
    createdAt: dbUser.createdAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [showWelcomeCards, setShowWelcomeCards] = useState(false);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedUser, storedOnboarded] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
      ]);
      
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        
        try {
          const response = await fetch(new URL(`/api/users/${parsed.id}`, getApiUrl()).toString());
          if (response.ok) {
            const freshUser = await response.json();
            const transformedUser = transformDbUserToProfile(freshUser);
            setUser(transformedUser);
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(transformedUser));
          }
        } catch (error) {
          console.log("Could not refresh user from server, using cached data");
        }
      }
      setIsOnboarded(storedOnboarded === "true");
    } catch (error) {
      console.error("Error loading stored data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/signin", { email, password });
      const data = await response.json();
      const transformedUser = transformDbUserToProfile(data.user);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(transformedUser));
      setUser(transformedUser);
      setShowWelcomeCards(true);
    } catch (error: any) {
      console.error("Sign in error:", error);
      const errorMessage = error.message || "";
      if (errorMessage.includes("Invalid credentials") || errorMessage.includes("401")) {
        throw new Error("Invalid email or password");
      }
      throw new Error("Unable to sign in. Please try again.");
    }
  };

  const signUp = async (email: string, password: string, familyName: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/signup", { email, password, familyName });
      const data = await response.json();
      const transformedUser = transformDbUserToProfile(data.user);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(transformedUser));
      setUser(transformedUser);
    } catch (error: any) {
      console.error("Sign up error:", error);
      const errorMessage = error.message || "";
      if (errorMessage.includes("already registered") || errorMessage.includes("Email already")) {
        throw new Error("This email is already registered. Please sign in instead.");
      }
      throw new Error("Failed to create account. Please try again.");
    }
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.ONBOARDED]);
    setUser(null);
    setIsOnboarded(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const dbUpdates: any = {};
      
      if (updates.familyName !== undefined) dbUpdates.familyName = updates.familyName;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.avatarUrl !== undefined) dbUpdates.avatarUrl = updates.avatarUrl;
      if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
      if (updates.familyMembers !== undefined) dbUpdates.familyMembers = updates.familyMembers;
      if (updates.profileHidden !== undefined) dbUpdates.profileHidden = updates.profileHidden;
      
      if (updates.location) {
        dbUpdates.suburb = updates.location.suburb;
        dbUpdates.city = updates.location.city;
        dbUpdates.lat = updates.location.lat;
        dbUpdates.lon = updates.location.lon;
        dbUpdates.radiusPreference = updates.location.radiusPreference;
      }

      const response = await apiRequest("PUT", `/api/users/${user.id}`, dbUpdates);
      const data = await response.json();
      const transformedUser = transformDbUserToProfile(data);
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(transformedUser));
      setUser(transformedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error("Failed to update profile");
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(new URL(`/api/users/${user.id}`, getApiUrl()).toString());
      if (response.ok) {
        const freshUser = await response.json();
        const transformedUser = transformDbUserToProfile(freshUser);
        setUser(transformedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(transformedUser));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
    setIsOnboarded(true);
    setShowWelcomeCards(true);
  };

  const dismissWelcomeCards = () => {
    setShowWelcomeCards(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        showWelcomeCards,
        signIn,
        signUp,
        signOut,
        updateProfile,
        completeOnboarding,
        refreshUser,
        dismissWelcomeCards,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
