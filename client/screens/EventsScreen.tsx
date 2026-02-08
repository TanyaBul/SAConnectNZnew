import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Pressable, Modal, ActivityIndicator, Platform, TextInput as RNTextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
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
import { BorderRadius, Spacing, Shadows, Typography } from "@/constants/theme";
import { getEvents, addEvent, getConnections, addConnection, getOrCreateThread, attendEvent, unattendEvent, formatRelativeTime, Event, EVENT_CATEGORIES, Connection, Family } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

let DateTimePicker: any = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function EventsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [events, setEvents] = useState<Event[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
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
  
  const [webDateInput, setWebDateInput] = useState("");
  const [webTimeInput, setWebTimeInput] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [eventsData, connectionsData] = await Promise.all([
        getEvents(),
        user?.id ? getConnections(user.id) : Promise.resolve([]),
      ]);
      setEvents(eventsData);
      setConnections(connectionsData);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getConnectionStatus = (userId: string) => {
    const connection = connections.find(
      (c) => c.targetUserId === userId || c.userId === userId
    );
    return connection?.status;
  };

  const handleConnect = async (targetUserId: string) => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const newConnection = await addConnection(user.id, targetUserId);
      if (newConnection) {
        setConnections([...connections, newConnection]);
      }
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  const handleMessage = async (eventUser: Family) => {
    if (!user?.id || !eventUser) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const thread = await getOrCreateThread(user.id, eventUser.id);
      if (thread) {
        navigation.navigate("Chat", { threadId: thread.id, family: eventUser });
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const handleToggleAttendance = async (event: Event) => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const isGoing = event.attendees?.includes(user.id);
    
    if (isGoing) {
      const success = await unattendEvent(event.id, user.id);
      if (success) {
        setEvents(events.map(e => 
          e.id === event.id 
            ? { ...e, attendees: e.attendees.filter(id => id !== user.id), attendeeCount: e.attendeeCount - 1 }
            : e
        ));
      }
    } else {
      const success = await attendEvent(event.id, user.id);
      if (success) {
        setEvents(events.map(e => 
          e.id === event.id 
            ? { ...e, attendees: [...(e.attendees || []), user.id], attendeeCount: (e.attendeeCount || 0) + 1 }
            : e
        ));
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventDate(new Date());
    setEventTime(new Date());
    setLocation("");
    setCategory("Social");
    setWebDateInput("");
    setWebTimeInput("");
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

  const getDateForSubmission = () => {
    if (Platform.OS === "web" && webDateInput) {
      return webDateInput;
    }
    return formatDateForStorage(eventDate);
  };

  const getTimeForSubmission = () => {
    if (Platform.OS === "web" && webTimeInput) {
      return webTimeInput;
    }
    return formatTimeForDisplay(eventTime);
  };

  const handleAddEvent = async () => {
    if (!title.trim() || !location.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!user?.id) return;
    
    setSaving(true);
    try {
      const newEvent = await addEvent(
        user.id,
        title.trim(),
        description.trim(),
        getDateForSubmission(),
        getTimeForSubmission(),
        location.trim(),
        category
      );
      if (newEvent) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setEvents([newEvent, ...events]);
        setModalVisible(false);
        resetForm();
      }
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

  const renderEvent = ({ item }: { item: Event }) => (
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
      
      <View style={styles.attendanceRow}>
        <View style={styles.attendeeCount}>
          <Feather name="users" size={16} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
            {(item.attendeeCount || 0) > 0 ? `${item.attendeeCount} going` : "Be the first to join!"}
          </ThemedText>
        </View>
        <Pressable
          style={[
            styles.goingButton,
            item.attendees?.includes(user?.id || "") 
              ? { backgroundColor: theme.primary }
              : { backgroundColor: theme.backgroundSecondary, borderWidth: 1, borderColor: theme.primary }
          ]}
          onPress={() => handleToggleAttendance(item)}
        >
          <Feather 
            name={item.attendees?.includes(user?.id || "") ? "check" : "calendar"} 
            size={14} 
            color={item.attendees?.includes(user?.id || "") ? "#FFFFFF" : theme.primary} 
          />
          <ThemedText 
            type="small" 
            style={{ 
              color: item.attendees?.includes(user?.id || "") ? "#FFFFFF" : theme.primary, 
              marginLeft: Spacing.xs,
              fontWeight: "600"
            }}
          >
            {item.attendees?.includes(user?.id || "") ? "Going" : "Will be there"}
          </ThemedText>
        </Pressable>
      </View>
      
      <View style={[styles.eventFooter, { borderTopColor: theme.border }]}>
        <View style={styles.hostInfo}>
          <Avatar uri={item.user?.avatarUrl} size="small" />
          <ThemedText type="caption" style={{ marginLeft: Spacing.sm }}>
            {item.user?.familyName || "Your Family"}
          </ThemedText>
        </View>
        {item.userId !== user?.id && item.user ? (
          <View style={styles.eventActions}>
            {getConnectionStatus(item.userId) === "connected" ? (
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.primary + "15" }]}
                onPress={() => handleMessage(item.user!)}
              >
                <Feather name="message-circle" size={16} color={theme.primary} />
                <ThemedText type="small" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
                  Message
                </ThemedText>
              </Pressable>
            ) : getConnectionStatus(item.userId) === "pending" ? (
              <View style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="clock" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                  Pending
                </ThemedText>
              </View>
            ) : (
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={() => handleConnect(item.userId)}
              >
                <Feather name="user-plus" size={16} color="#FFFFFF" />
                <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: Spacing.xs }}>
                  Connect
                </ThemedText>
              </Pressable>
            )}
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  const renderDatePicker = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.webInputContainer}>
          <ThemedText type="caption" style={styles.fieldLabel}>Date</ThemedText>
          <View style={[styles.webInputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Feather name="calendar" size={18} color={theme.primary} style={styles.webInputIcon} />
            <RNTextInput
              style={[styles.webInput, { color: theme.text, fontFamily: Typography.body.fontFamily }]}
              placeholder="YYYY-MM-DD (e.g., 2026-02-15)"
              placeholderTextColor={theme.textSecondary}
              value={webDateInput}
              onChangeText={setWebDateInput}
              testID="input-date"
            />
          </View>
        </View>
      );
    }
    
    return (
      <>
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
        
        {showDatePicker && DateTimePicker ? (
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
      </>
    );
  };

  const renderTimePicker = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.webInputContainer}>
          <ThemedText type="caption" style={styles.fieldLabel}>Time</ThemedText>
          <View style={[styles.webInputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Feather name="clock" size={18} color={theme.primary} style={styles.webInputIcon} />
            <RNTextInput
              style={[styles.webInput, { color: theme.text, fontFamily: Typography.body.fontFamily }]}
              placeholder="e.g., 2:00 PM"
              placeholderTextColor={theme.textSecondary}
              value={webTimeInput}
              onChangeText={setWebTimeInput}
              testID="input-time"
            />
          </View>
        </View>
      );
    }
    
    return (
      <>
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
        
        {showTimePicker && DateTimePicker ? (
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
      </>
    );
  };

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
        ListHeaderComponent={
          <Pressable
            style={[styles.pinnedBanner, { backgroundColor: theme.primary + "12", borderColor: theme.primary + "30" }]}
            onPress={() => setModalVisible(true)}
          >
            <Feather name="calendar" size={18} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary, fontWeight: "600", flex: 1, marginLeft: Spacing.sm }}>
              List your event for free to the SA community!
            </ThemedText>
            <Feather name="chevron-right" size={16} color={theme.primary} />
          </Pressable>
        }
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
            <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              List your event for free to the SA community in New Zealand. Braais, playdates, sports days, church events and more!
            </ThemedText>

            <Input
              label="Event Title"
              placeholder="e.g., Weekend Braai at the Park"
              value={title}
              onChangeText={setTitle}
              testID="input-title"
            />
            
            <Input
              label="Description (optional)"
              placeholder="Tell people what to expect..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              testID="input-description"
            />
            
            {renderDatePicker()}
            
            {renderTimePicker()}
            
            <Input
              label="Location"
              placeholder="e.g., Cornwall Park, Auckland"
              value={location}
              onChangeText={setLocation}
              testID="input-location"
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
  pinnedBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
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
    flex: 1,
  },
  eventActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  attendanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  attendeeCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  goingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
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
    marginBottom: Spacing.lg,
  },
  pickerContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  doneButton: {
    marginTop: Spacing.sm,
    alignSelf: "flex-end",
  },
  webInputContainer: {
    marginBottom: Spacing.lg,
  },
  webInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    height: Spacing.inputHeight,
  },
  webInputIcon: {
    marginLeft: Spacing.lg,
  },
  webInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    height: "100%",
  },
  categoryLabel: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
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
