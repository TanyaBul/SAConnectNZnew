import { useState, useCallback, useRef, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getThreads, getEvents, getBusinesses } from "@/lib/storage";

const LAST_SEEN_EVENTS_KEY = "lastSeenEventsCount";
const LAST_SEEN_BUSINESS_KEY = "lastSeenBusinessCount";

export function useTabBadges(userId?: string) {
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [hasNewEvents, setHasNewEvents] = useState(false);
  const [hasNewBusinesses, setHasNewBusinesses] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkBadges = useCallback(async () => {
    if (!userId) return;

    try {
      const [threads, events, businesses] = await Promise.all([
        getThreads(userId),
        getEvents(),
        getBusinesses(),
      ]);

      const totalUnread = threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
      setHasUnreadMessages(totalUnread > 0);

      const lastSeenEvents = await AsyncStorage.getItem(LAST_SEEN_EVENTS_KEY);
      const lastEventCount = lastSeenEvents ? parseInt(lastSeenEvents, 10) : 0;
      setHasNewEvents(events.length > lastEventCount);

      const lastSeenBusiness = await AsyncStorage.getItem(LAST_SEEN_BUSINESS_KEY);
      const lastBusinessCount = lastSeenBusiness ? parseInt(lastSeenBusiness, 10) : 0;
      setHasNewBusinesses(businesses.length > lastBusinessCount);
    } catch (error) {
      // silently fail
    }
  }, [userId]);

  useEffect(() => {
    checkBadges();
    intervalRef.current = setInterval(checkBadges, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkBadges]);

  const markEventsSeen = useCallback(async () => {
    try {
      const events = await getEvents();
      await AsyncStorage.setItem(LAST_SEEN_EVENTS_KEY, String(events.length));
      setHasNewEvents(false);
    } catch {}
  }, []);

  const markBusinessesSeen = useCallback(async () => {
    try {
      const businesses = await getBusinesses();
      await AsyncStorage.setItem(LAST_SEEN_BUSINESS_KEY, String(businesses.length));
      setHasNewBusinesses(false);
    } catch {}
  }, []);

  const markMessagesSeen = useCallback(() => {
    setHasUnreadMessages(false);
  }, []);

  return {
    hasUnreadMessages,
    hasNewEvents,
    hasNewBusinesses,
    markEventsSeen,
    markBusinessesSeen,
    markMessagesSeen,
    refresh: checkBadges,
  };
}
