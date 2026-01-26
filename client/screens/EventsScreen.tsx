import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Pressable, Modal, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { InterestTag } from "@/components/InterestTag";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { getEvents, getFamilies, addEvent, formatRelativeTime, Event, Family, EVENT_CATEGORIES } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";

interface EventWithFamily extends Event {
  family: Family | null;
}

export default function EventsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { user } = useAuth();

  const [events, setEvents] = useState<EventWithFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Social");
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [eventsData, familiesData] = await Promise.all([
        getEvents(),
        getFamilies(),
      ]);
      
      const eventsWithFamilies = eventsData.map((event) => {
        const family = familiesData.find((f) => f.id === event.userId) || null;
        return { ...event, family };
      });
      
      setEvents(eventsWithFamilies);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventDate(new Date());
    setEventTime(new Date());
    setLocation("");
    setCategory("Social");
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-NZ", { 
      weekday: "short", 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString("en-NZ", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  const formatDateForStorage = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setEventTime(selectedTime);
    }
  };

  const handleAddEvent = async () => {
    if (!title.trim() || !location.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSaving(true);
    try {
      const newEvent = await addEvent(
        user?.id || "user",
        title.trim(),
        description.trim(),
        formatDateForStorage(eventDate),
        formatTimeForDisplay(eventTime),
        location.trim(),
        category
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEvents([{ ...newEvent, family: null }, ...events]);
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error adding event:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-NZ", { weekday: "short", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const renderEvent = ({ item }: { item: EventWithFamily }) => (
    <Pressable
      style={[
        styles.eventCard,
        { backgroundColor: theme.backgroundDefault, ...Shadows.card },
      ]}
    >
      <View style={styles.eventHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: theme.primary + "15" }]}>
          <ThemedText type="small" style={{ color: theme.primary, fontWeight: "500" }}>
            {item.category}
          </ThemedText>
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatRelativeTime(item.createdAt)}
        </ThemedText>
      </View>
      
      <ThemedText type="heading" style={styles.eventTitle}>
        {item.title}
      </ThemedText>
      
      {item.description ? (
        <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
          {item.description}
        </ThemedText>
      ) : null}
      
      <View style={styles.eventDetails}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
            {formatEventDate(item.date)}{item.time ? ` at ${item.time}` : ""}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
            {item.location}
          </ThemedText>
        </View>
      </View>
      
      <View style={[styles.eventFooter, { borderTopColor: theme.border }]}>
        <View style={styles.hostInfo}>
          <Avatar uri={item.family?.avatarUrl} size="small" />
          <ThemedText type="caption" style={{ marginLeft: Spacing.sm }}>
            {item.family?.familyName || "Your Family"}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.lg,
          },
          events.length === 0 && styles.emptyList,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            image="events"
            title="No Events Yet"
            description="Be the first to create an event for the SA community!"
            actionLabel="Create Event"
            onAction={() => setModalVisible(true)}
          />
        }
      />
      
      {events.length > 0 ? (
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary, ...Shadows.fab }]}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
            <ThemedText type="heading">New Event</ThemedText>
            <View style={{ width: 50 }} />
          </View>
          
          <KeyboardAwareScrollViewCompat
            style={styles.modalScroll}
            contentContainerStyle={[styles.modalContent, { paddingBottom: insets.bottom + Spacing.xl }]}
          >
            <Input
              label="Event Title"
              placeholder="e.g., Weekend Braai at the Park"
              value={title}
              onChangeText={setTitle}
            />
            
            <Input
              label="Description (optional)"
              placeholder="Tell people what to expect..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
            
            <ThemedText type="caption" style={styles.fieldLabel}>Date</ThemedText>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setShowDatePicker(true);
              }}
              style={[styles.pickerButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            >
              <Feather name="calendar" size={18} color={theme.primary} />
              <ThemedText type="body" style={{ marginLeft: Spacing.md, flex: 1 }}>
                {formatDateForDisplay(eventDate)}
              </ThemedText>
              <Feather name="chevron-down" size={18} color={theme.textSecondary} />
            </Pressable>
            
            {showDatePicker ? (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  textColor={theme.text}
                  accentColor={theme.primary}
                />
                {Platform.OS === "ios" ? (
                  <Button
                    variant="secondary"
                    size="small"
                    onPress={() => setShowDatePicker(false)}
                    style={styles.doneButton}
                  >
                    Done
                  </Button>
                ) : null}
              </View>
            ) : null}
            
            <ThemedText type="caption" style={styles.fieldLabel}>Time</ThemedText>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setShowTimePicker(true);
              }}
              style={[styles.pickerButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            >
              <Feather name="clock" size={18} color={theme.primary} />
              <ThemedText type="body" style={{ marginLeft: Spacing.md, flex: 1 }}>
                {formatTimeForDisplay(eventTime)}
              </ThemedText>
              <Feather name="chevron-down" size={18} color={theme.textSecondary} />
            </Pressable>
            
            {showTimePicker ? (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={eventTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                  textColor={theme.text}
                  accentColor={theme.primary}
                />
                {Platform.OS === "ios" ? (
                  <Button
                    variant="secondary"
                    size="small"
                    onPress={() => setShowTimePicker(false)}
                    style={styles.doneButton}
                  >
                    Done
                  </Button>
                ) : null}
              </View>
            ) : null}
            
            <Input
              label="Location"
              placeholder="e.g., Cornwall Park, Auckland"
              value={location}
              onChangeText={setLocation}
            />
            
            <ThemedText type="caption" style={styles.categoryLabel}>Category</ThemedText>
            <View style={styles.categoryGrid}>
              {EVENT_CATEGORIES.map((cat) => (
                <InterestTag
                  key={cat}
                  label={cat}
                  selected={category === cat}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(cat);
                  }}
                />
              ))}
            </View>
            
            <Button
              onPress={handleAddEvent}
              loading={saving}
              size="large"
              style={styles.createButton}
            >
              Create Event
            </Button>
          </KeyboardAwareScrollViewCompat>
        </ThemedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  eventCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  eventTitle: {
    marginBottom: Spacing.sm,
  },
  eventDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: Spacing.xl,
  },
  fieldLabel: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  pickerContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  doneButton: {
    marginTop: Spacing.sm,
    alignSelf: "flex-end",
  },
  categoryLabel: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing["3xl"],
  },
  createButton: {
    marginTop: Spacing.lg,
  },
});
