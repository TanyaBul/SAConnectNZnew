import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Kid {
  id: string;
  name: string;
  age: number;
}

export interface UserProfile {
  id: string;
  email: string;
  familyName: string;
  bio: string;
  avatarUrl: string | null;
  location: {
    suburb: string;
    city: string;
    lat: number;
    lon: number;
    radiusPreference: number;
  } | null;
  kids: Kid[];
  interests: string[];
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, familyName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  USER: "@sa_connect_user",
  ONBOARDED: "@sa_connect_onboarded",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

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
        setUser(JSON.parse(storedUser));
      }
      setIsOnboarded(storedOnboarded === "true");
    } catch (error) {
      console.error("Error loading stored data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.email === email) {
        setUser(parsed);
        return;
      }
    }
    throw new Error("Invalid credentials");
  };

  const signUp = async (email: string, password: string, familyName: string) => {
    const newUser: UserProfile = {
      id: Date.now().toString(),
      email,
      familyName,
      bio: "",
      avatarUrl: null,
      location: null,
      kids: [],
      interests: [],
      createdAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    setUser(newUser);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.ONBOARDED]);
    setUser(null);
    setIsOnboarded(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
    setIsOnboarded(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        signIn,
        signUp,
        signOut,
        updateProfile,
        completeOnboarding,
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
