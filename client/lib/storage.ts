import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, getApiUrl } from "./query-client";
import { UserProfile, FamilyMember } from "@/context/AuthContext";

export interface Family {
  id: string;
  email: string;
  familyName: string;
  bio: string;
  avatarUrl: string | null;
  suburb?: string;
  city?: string;
  lat?: number;
  lon?: number;
  radiusPreference?: number;
  interests: string[];
  familyMembers: FamilyMember[];
  createdAt: string;
  distance?: number;
}

export interface Connection {
  id: string;
  userId: string;
  targetUserId: string;
  status: "pending" | "connected" | "blocked";
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface MessageThread {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  otherUser: Family;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string;
  category: string;
  createdAt: string;
  user?: Family;
  attendeeCount: number;
  attendees: string[];
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  promotion: string | null;
  active: boolean;
  createdAt: string;
  user?: Family;
}

export const BUSINESS_CATEGORIES = [
  "Food & Baking",
  "Beauty & Wellness",
  "Home Services",
  "Health & Fitness",
  "Education & Tutoring",
  "Childcare",
  "Events & Entertainment",
  "Arts & Crafts",
  "Professional Services",
  "Retail",
  "Transport",
  "Other",
];

const STORAGE_KEYS = {
  ONBOARDED: "@sa_connect_onboarded",
};

export async function getFamilies(userId?: string): Promise<Family[]> {
  if (!userId) return [];
  
  try {
    const response = await fetch(new URL(`/api/discover/${userId}`, getApiUrl()).toString());
    if (!response.ok) {
      console.error("Failed to fetch families");
      return [];
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching families:", error);
    return [];
  }
}

export async function getFamily(userId: string): Promise<Family | null> {
  try {
    const response = await fetch(new URL(`/api/users/${userId}`, getApiUrl()).toString());
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching family:", error);
    return null;
  }
}

export async function getConnections(userId: string): Promise<Connection[]> {
  try {
    const response = await fetch(new URL(`/api/connections/${userId}`, getApiUrl()).toString());
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching connections:", error);
    return [];
  }
}

export async function addConnection(userId: string, targetUserId: string): Promise<Connection | null> {
  try {
    const response = await apiRequest("POST", "/api/connections", { userId, targetUserId });
    return await response.json();
  } catch (error) {
    console.error("Error adding connection:", error);
    return null;
  }
}

export async function updateConnectionStatus(connectionId: string, status: string): Promise<Connection | null> {
  try {
    const response = await apiRequest("PUT", `/api/connections/${connectionId}`, { status });
    return await response.json();
  } catch (error) {
    console.error("Error updating connection:", error);
    return null;
  }
}

export async function getThreads(userId: string): Promise<MessageThread[]> {
  try {
    const response = await fetch(new URL(`/api/threads/${userId}`, getApiUrl()).toString());
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching threads:", error);
    return [];
  }
}

export async function getOrCreateThread(userId1: string, userId2: string): Promise<MessageThread | null> {
  try {
    const response = await apiRequest("POST", "/api/threads", { userId1, userId2 });
    return await response.json();
  } catch (error) {
    console.error("Error creating thread:", error);
    return null;
  }
}

export async function getMessages(threadId: string): Promise<Message[]> {
  try {
    const response = await fetch(new URL(`/api/messages/${threadId}`, getApiUrl()).toString());
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function sendMessage(threadId: string, senderId: string, text: string): Promise<Message | null> {
  try {
    const response = await apiRequest("POST", "/api/messages", { threadId, senderId, text });
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

export async function markThreadAsRead(threadId: string, userId: string): Promise<void> {
  try {
    await apiRequest("PUT", `/api/threads/${threadId}/read`, { userId });
  } catch (error) {
    console.error("Error marking thread as read:", error);
  }
}

export async function getEvents(userId?: string): Promise<Event[]> {
  try {
    const url = new URL("/api/events", getApiUrl());
    if (userId) {
      url.searchParams.set("userId", userId);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function addEvent(
  userId: string,
  title: string,
  description: string,
  date: string,
  time: string,
  location: string,
  category: string
): Promise<Event | null> {
  try {
    const response = await apiRequest("POST", "/api/events", {
      userId,
      title,
      description,
      date,
      time,
      location,
      category,
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding event:", error);
    return null;
  }
}

export async function updateEvent(
  eventId: string,
  data: { title?: string; description?: string; date?: string; time?: string; location?: string; category?: string }
): Promise<Event | null> {
  try {
    const response = await apiRequest("PUT", `/api/events/${eventId}`, data);
    return await response.json();
  } catch (error) {
    console.error("Error updating event:", error);
    return null;
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const response = await fetch(new URL(`/api/events/${eventId}`, getApiUrl()).toString(), {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
}

export async function attendEvent(eventId: string, userId: string): Promise<boolean> {
  try {
    const response = await apiRequest("POST", `/api/events/${eventId}/attend`, { userId });
    return response.ok;
  } catch (error) {
    console.error("Error attending event:", error);
    return false;
  }
}

export async function unattendEvent(eventId: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(new URL(`/api/events/${eventId}/attend/${userId}`, getApiUrl()).toString(), {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error removing attendance:", error);
    return false;
  }
}

export async function addFamilyMember(userId: string, name: string, age: number): Promise<FamilyMember | null> {
  try {
    const response = await apiRequest("POST", `/api/users/${userId}/family-members`, { name, age });
    return await response.json();
  } catch (error) {
    console.error("Error adding family member:", error);
    return null;
  }
}

export async function updateFamilyMember(memberId: string, name: string, age: number): Promise<FamilyMember | null> {
  try {
    const response = await apiRequest("PUT", `/api/family-members/${memberId}`, { name, age });
    return await response.json();
  } catch (error) {
    console.error("Error updating family member:", error);
    return null;
  }
}

export async function deleteFamilyMember(memberId: string): Promise<void> {
  try {
    await apiRequest("DELETE", `/api/family-members/${memberId}`);
  } catch (error) {
    console.error("Error deleting family member:", error);
  }
}

export const EVENT_CATEGORIES = [
  "Braai",
  "Playdate",
  "Sports",
  "Cultural",
  "Market",
  "Social",
  "Kids",
  "Other",
];

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-NZ", { month: "short", day: "numeric" });
}

export const INTERESTS_OPTIONS = [
  "Braais",
  "Rugby",
  "Cricket",
  "Church",
  "Schools",
  "Sports",
  "Markets",
  "SA Culture",
  "Beach",
  "Hiking",
  "Cooking",
  "Music",
  "Netball",
  "Business",
  "Cycling",
  "Playgroups",
];

export const REPORT_REASONS = [
  "Inappropriate content",
  "Harassment or bullying",
  "Fake profile",
  "Spam",
  "Other",
];

export async function blockUser(userId: string, blockedUserId: string): Promise<boolean> {
  try {
    const response = await fetch(new URL(`/api/users/${userId}/block`, getApiUrl()).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedUserId }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error blocking user:", error);
    return false;
  }
}

export async function unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
  try {
    const response = await fetch(new URL(`/api/users/${userId}/block/${blockedUserId}`, getApiUrl()).toString(), {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error unblocking user:", error);
    return false;
  }
}

export async function getBlockedUsers(userId: string): Promise<string[]> {
  try {
    const response = await fetch(new URL(`/api/users/${userId}/blocked`, getApiUrl()).toString());
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error getting blocked users:", error);
    return [];
  }
}

export async function reportUser(
  reporterId: string,
  reportedUserId: string,
  reason: string,
  details?: string
): Promise<boolean> {
  try {
    const response = await fetch(new URL("/api/reports", getApiUrl()).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reporterId, reportedUserId, reason, details }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error reporting user:", error);
    return false;
  }
}

export async function getBusinesses(): Promise<Business[]> {
  try {
    const response = await fetch(new URL("/api/businesses", getApiUrl()).toString());
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return [];
  }
}

export async function getBusinessById(id: string): Promise<Business | null> {
  try {
    const response = await fetch(new URL(`/api/businesses/${id}`, getApiUrl()).toString());
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching business:", error);
    return null;
  }
}

export async function createBusiness(
  userId: string,
  data: {
    name: string;
    description?: string;
    category: string;
    location?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    promotion?: string;
  }
): Promise<Business | null> {
  try {
    const response = await apiRequest("POST", "/api/businesses", { userId, ...data });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error creating business:", error);
    return null;
  }
}

export async function updateBusiness(
  id: string,
  data: Partial<Business>
): Promise<Business | null> {
  try {
    const response = await fetch(new URL(`/api/businesses/${id}`, getApiUrl()).toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error updating business:", error);
    return null;
  }
}

export async function deleteBusiness(id: string): Promise<boolean> {
  try {
    const response = await fetch(new URL(`/api/businesses/${id}`, getApiUrl()).toString(), {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting business:", error);
    return false;
  }
}

export interface FamilyPhoto {
  id: string;
  userId: string;
  photoUrl: string;
  sortOrder: number;
  createdAt: string;
}

export async function getFamilyPhotos(userId: string): Promise<FamilyPhoto[]> {
  try {
    const response = await fetch(new URL(`/api/users/${userId}/photos`, getApiUrl()).toString());
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching family photos:", error);
    return [];
  }
}

export async function uploadFamilyPhoto(userId: string, imageData: string): Promise<FamilyPhoto | null> {
  try {
    const baseUrl = getApiUrl();
    const url = new URL(`/api/users/${userId}/photos`, baseUrl).toString();

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData }),
    });

    if (!response.ok) {
      console.error("Upload failed:", response.status, await response.text());
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error uploading family photo:", error);
    return null;
  }
}

export async function deleteFamilyPhoto(userId: string, photoId: string): Promise<boolean> {
  try {
    const response = await fetch(new URL(`/api/users/${userId}/photos/${photoId}`, getApiUrl()).toString(), {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting family photo:", error);
    return false;
  }
}
