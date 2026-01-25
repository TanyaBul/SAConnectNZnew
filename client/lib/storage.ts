import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile, Kid } from "@/context/AuthContext";

export interface Family extends UserProfile {
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
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Photo {
  id: string;
  userId: string;
  url: string;
  caption: string;
  uploadedAt: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  FAMILIES: "@sa_connect_families",
  CONNECTIONS: "@sa_connect_connections",
  MESSAGES: "@sa_connect_messages",
  THREADS: "@sa_connect_threads",
  PHOTOS: "@sa_connect_photos",
  EVENTS: "@sa_connect_events",
};

const SAMPLE_FAMILIES: Family[] = [
  {
    id: "1",
    email: "vandermerwe@example.com",
    familyName: "Van der Merwe Family",
    bio: "Originally from Cape Town, now living our best life in Auckland! We love hiking, braais, and making new SA friends.",
    avatarUrl: null,
    location: {
      suburb: "Parnell",
      city: "Auckland",
      lat: -36.8509,
      lon: 174.7811,
      radiusPreference: 25,
    },
    kids: [
      { id: "k1", name: "Pieter", age: 8 },
      { id: "k2", name: "Lize", age: 5 },
    ],
    interests: ["Hiking", "Braais", "Rugby", "Beach"],
    createdAt: new Date().toISOString(),
    distance: 3.2,
  },
  {
    id: "2",
    email: "naidoo@example.com",
    familyName: "Naidoo Family",
    bio: "Durban expats missing bunny chows and the warm Indian Ocean! Looking for other SA families for playdates.",
    avatarUrl: null,
    location: {
      suburb: "Mt Eden",
      city: "Auckland",
      lat: -36.8784,
      lon: 174.7567,
      radiusPreference: 15,
    },
    kids: [
      { id: "k3", name: "Priya", age: 6 },
      { id: "k4", name: "Raj", age: 4 },
      { id: "k5", name: "Maya", age: 2 },
    ],
    interests: ["Cricket", "Cooking", "Church", "SA Culture"],
    createdAt: new Date().toISOString(),
    distance: 5.8,
  },
  {
    id: "3",
    email: "botha@example.com",
    familyName: "Botha Family",
    bio: "From Pretoria with love! Two girls who miss their Oumas. Looking for SA community in Wellington area.",
    avatarUrl: null,
    location: {
      suburb: "Karori",
      city: "Wellington",
      lat: -41.2816,
      lon: 174.7403,
      radiusPreference: 20,
    },
    kids: [
      { id: "k6", name: "Anri", age: 10 },
      { id: "k7", name: "Elsa", age: 7 },
    ],
    interests: ["Schools", "Sports", "Markets", "Netball"],
    createdAt: new Date().toISOString(),
    distance: 12.4,
  },
  {
    id: "4",
    email: "dlamini@example.com",
    familyName: "Dlamini Family",
    bio: "Johannesburg roots, Christchurch home! We run a small business and love connecting with fellow South Africans.",
    avatarUrl: null,
    location: {
      suburb: "Riccarton",
      city: "Christchurch",
      lat: -43.5310,
      lon: 172.5874,
      radiusPreference: 30,
    },
    kids: [
      { id: "k8", name: "Thabo", age: 12 },
    ],
    interests: ["Business", "SA Culture", "Rugby", "Music"],
    createdAt: new Date().toISOString(),
    distance: 8.1,
  },
  {
    id: "5",
    email: "smith@example.com",
    familyName: "Smith Family",
    bio: "Port Elizabeth family enjoying the Kiwi lifestyle. Always up for a good braai and catching the Springboks play!",
    avatarUrl: null,
    location: {
      suburb: "Grey Lynn",
      city: "Auckland",
      lat: -36.8578,
      lon: 174.7361,
      radiusPreference: 10,
    },
    kids: [
      { id: "k9", name: "Jake", age: 9 },
      { id: "k10", name: "Emma", age: 6 },
    ],
    interests: ["Braais", "Rugby", "Beach", "Cycling"],
    createdAt: new Date().toISOString(),
    distance: 2.1,
  },
];

const SAMPLE_THREADS: MessageThread[] = [
  {
    id: "t1",
    participants: ["user", "1"],
    lastMessage: "Would love to catch up for a braai this weekend!",
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 2,
  },
  {
    id: "t2",
    participants: ["user", "2"],
    lastMessage: "The kids had so much fun at the playdate!",
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
  },
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: "m1",
    threadId: "t1",
    senderId: "1",
    text: "Hi! Saw you're also from SA. Welcome to NZ!",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
  {
    id: "m2",
    threadId: "t1",
    senderId: "user",
    text: "Thanks so much! It's great to find other SA families here.",
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    read: true,
  },
  {
    id: "m3",
    threadId: "t1",
    senderId: "1",
    text: "Would love to catch up for a braai this weekend!",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: "m4",
    threadId: "t2",
    senderId: "user",
    text: "Thanks for having us over yesterday!",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
  {
    id: "m5",
    threadId: "t2",
    senderId: "2",
    text: "The kids had so much fun at the playdate!",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
];

export async function initializeSampleData(): Promise<void> {
  const families = await AsyncStorage.getItem(STORAGE_KEYS.FAMILIES);
  if (!families) {
    await AsyncStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(SAMPLE_FAMILIES));
    await AsyncStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(SAMPLE_THREADS));
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(SAMPLE_MESSAGES));
    await AsyncStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify([
      { id: "c1", userId: "user", targetUserId: "1", status: "connected", createdAt: new Date().toISOString() },
      { id: "c2", userId: "user", targetUserId: "2", status: "connected", createdAt: new Date().toISOString() },
    ]));
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify([]));
  }
}

export async function getFamilies(): Promise<Family[]> {
  await initializeSampleData();
  const data = await AsyncStorage.getItem(STORAGE_KEYS.FAMILIES);
  return data ? JSON.parse(data) : [];
}

export async function getConnections(): Promise<Connection[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.CONNECTIONS);
  return data ? JSON.parse(data) : [];
}

export async function addConnection(targetUserId: string): Promise<Connection> {
  const connections = await getConnections();
  const newConnection: Connection = {
    id: Date.now().toString(),
    userId: "user",
    targetUserId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  connections.push(newConnection);
  await AsyncStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
  return newConnection;
}

export async function getThreads(): Promise<MessageThread[]> {
  await initializeSampleData();
  const data = await AsyncStorage.getItem(STORAGE_KEYS.THREADS);
  return data ? JSON.parse(data) : [];
}

export async function getMessages(threadId: string): Promise<Message[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  const messages: Message[] = data ? JSON.parse(data) : [];
  return messages.filter((m) => m.threadId === threadId);
}

export async function sendMessage(threadId: string, text: string): Promise<Message> {
  const messages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  const allMessages: Message[] = messages ? JSON.parse(messages) : [];
  
  const newMessage: Message = {
    id: Date.now().toString(),
    threadId,
    senderId: "user",
    text,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  allMessages.push(newMessage);
  await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));

  const threads = await getThreads();
  const threadIndex = threads.findIndex((t) => t.id === threadId);
  if (threadIndex !== -1) {
    threads[threadIndex].lastMessage = text;
    threads[threadIndex].lastMessageAt = newMessage.timestamp;
    await AsyncStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
  }
  
  return newMessage;
}

export async function markThreadAsRead(threadId: string): Promise<void> {
  const threads = await getThreads();
  const threadIndex = threads.findIndex((t) => t.id === threadId);
  if (threadIndex !== -1) {
    threads[threadIndex].unreadCount = 0;
    await AsyncStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
  }

  const messages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  const allMessages: Message[] = messages ? JSON.parse(messages) : [];
  const updatedMessages = allMessages.map((m) => 
    m.threadId === threadId ? { ...m, read: true } : m
  );
  await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
}

export async function getPhotos(): Promise<Photo[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.PHOTOS);
  return data ? JSON.parse(data) : [];
}

export async function addPhoto(userId: string, uri: string, caption: string): Promise<Photo> {
  const photos = await getPhotos();
  const newPhoto: Photo = {
    id: Date.now().toString(),
    userId,
    url: uri,
    caption,
    uploadedAt: new Date().toISOString(),
  };
  photos.unshift(newPhoto);
  await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
  return newPhoto;
}

export async function getEvents(): Promise<Event[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
  return data ? JSON.parse(data) : [];
}

export async function addEvent(
  userId: string,
  title: string,
  description: string,
  date: string,
  time: string,
  location: string,
  category: string
): Promise<Event> {
  const events = await getEvents();
  const newEvent: Event = {
    id: Date.now().toString(),
    userId,
    title,
    description,
    date,
    time,
    location,
    category,
    createdAt: new Date().toISOString(),
  };
  events.unshift(newEvent);
  await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  return newEvent;
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
