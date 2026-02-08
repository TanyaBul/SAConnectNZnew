import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Dimensions, Pressable, Image, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const logoImage = require("../../assets/images/icon.png");

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;

interface WelcomeCardData {
  id?: string;
  icon: string;
  header: string;
  title: string;
  bullets: string[];
  accentColor: string;
  borderColor: string;
  promoText: string;
  imageUrl?: string | null;
}

const DEFAULT_CARDS: WelcomeCardData[] = [
  {
    icon: "heart",
    header: "Welcome Back",
    title: "Connect with Families",
    bullets: [
      "Meet fellow SA neighbours in your area",
      "Find events or start local gatherings",
      "Build your community in New Zealand",
    ],
    accentColor: "#E8703A",
    borderColor: "#E8703A",
    promoText: "Watch this space for special promotions and events",
  },
  {
    icon: "calendar",
    header: "Get Together",
    title: "Join Community Events",
    bullets: [
      "Braais, playdates & rugby watch parties",
      "RSVP and see who's attending",
      "Create your own events for everyone",
    ],
    accentColor: "#1A7F7F",
    borderColor: "#1A7F7F",
    promoText: "Watch this space for special promotions and events",
  },
  {
    icon: "message-circle",
    header: "Stay in Touch",
    title: "Chat & Connect",
    bullets: [
      "Send connection requests to families",
      "Chat privately once connected",
      "Share tips, advice & lekker stories",
    ],
    accentColor: "#F5A623",
    borderColor: "#F5A623",
    promoText: "Watch this space for special promotions and events",
  },
];

interface SwipeableCardProps {
  card: WelcomeCardData;
  onDismiss: () => void;
  isTop: boolean;
  index: number;
  totalRemaining: number;
}

function SwipeableCard({ card, onDismiss, isTop, index, totalRemaining }: SwipeableCardProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const stackOffset = Math.min(index, 2);

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotateZ.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-10, 0, 10],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 300 });
        rotateZ.value = withTiming(direction * 20, { duration: 300 });
        cardOpacity.value = withTiming(0, { duration: 250 }, () => {
          runOnJS(dismiss)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        rotateZ.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  const STACK_ROTATIONS = [-3, 2.5];

  const animatedCardStyle = useAnimatedStyle(() => {
    if (isTop) {
      return {
        transform: [
          { translateX: translateX.value },
          { rotate: `${rotateZ.value}deg` },
          { scale: 1 },
          { translateY: 0 },
        ],
        opacity: cardOpacity.value,
      };
    }
    const rot = stackOffset <= STACK_ROTATIONS.length ? STACK_ROTATIONS[stackOffset - 1] : 0;
    return {
      transform: [
        { translateX: 0 },
        { rotate: `${rot}deg` },
        { scale: 1 - stackOffset * 0.03 },
        { translateY: stackOffset * -6 },
      ],
      opacity: 1,
    };
  });

  const hasImage = card.imageUrl ? true : false;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: card.borderColor + "50",
            zIndex: totalRemaining - index,
          },
          animatedCardStyle,
        ]}
      >
        {hasImage ? (
          <Image
            source={{ uri: card.imageUrl!.startsWith("/") ? new URL(card.imageUrl!, getApiUrl()).toString() : card.imageUrl! }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={logoImage}
            style={styles.watermarkLogo}
            resizeMode="contain"
          />
        )}

        <View style={styles.cardContent}>
          <View style={[styles.headerBadge, { backgroundColor: card.accentColor + "15" }]}>
            <Feather name={card.icon as any} size={18} color={card.accentColor} />
            <ThemedText type="caption" style={{ color: card.accentColor, fontWeight: "600" }}>
              {card.header}
            </ThemedText>
          </View>

          <ThemedText type="h2" style={[styles.cardTitle, { color: theme.text }]}>
            {card.title}
          </ThemedText>

          <View style={styles.bulletList}>
            {card.bullets.map((bullet, idx) => (
              <View key={`${bullet}-${idx}`} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: card.accentColor }]} />
                <ThemedText type="body" style={[styles.bulletText, { color: theme.textSecondary }]}>
                  {bullet}
                </ThemedText>
              </View>
            ))}
          </View>

          {card.promoText ? (
            <View style={[styles.promoBanner, { backgroundColor: card.accentColor }]}>
              <View style={styles.promoIconRow}>
                <Feather name="star" size={14} color="#FFFFFF" />
                <Feather name="star" size={14} color="#FFFFFF" />
                <Feather name="star" size={14} color="#FFFFFF" />
              </View>
              <ThemedText type="body" style={styles.promoText}>
                {card.promoText}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {isTop ? (
          <View style={styles.swipeButtonContainer}>
            <Pressable
              style={[styles.swipeButton, { backgroundColor: card.accentColor + "15", borderColor: card.accentColor + "30" }]}
              onPress={() => {
                translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
                rotateZ.value = withTiming(-20, { duration: 300 });
                cardOpacity.value = withTiming(0, { duration: 250 }, () => {
                  runOnJS(dismiss)();
                });
              }}
            >
              <Feather name="chevron-left" size={22} color={card.accentColor} />
            </Pressable>

            <View style={styles.swipeLabelContainer}>
              <Feather name="more-horizontal" size={20} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Swipe or tap
              </ThemedText>
            </View>

            <Pressable
              style={[styles.swipeButton, { backgroundColor: card.accentColor + "15", borderColor: card.accentColor + "30" }]}
              onPress={() => {
                translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
                rotateZ.value = withTiming(20, { duration: 300 });
                cardOpacity.value = withTiming(0, { duration: 250 }, () => {
                  runOnJS(dismiss)();
                });
              }}
            >
              <Feather name="chevron-right" size={22} color={card.accentColor} />
            </Pressable>
          </View>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

interface WelcomeCardsProps {
  onComplete: () => void;
}

export function WelcomeCards({ onComplete }: WelcomeCardsProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<WelcomeCardData[]>([]);
  const [dismissedCount, setDismissedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch(new URL("/api/welcome-cards", getApiUrl()).toString());
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setCards(data);
          } else {
            setCards(DEFAULT_CARDS);
          }
        } else {
          setCards(DEFAULT_CARDS);
        }
      } catch {
        setCards(DEFAULT_CARDS);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  const remainingCards = cards.slice(dismissedCount);

  const handleDismiss = useCallback(() => {
    setDismissedCount((prev) => {
      const next = prev + 1;
      if (next >= cards.length) {
        setTimeout(() => onComplete(), 100);
      }
      return next;
    });
  }, [onComplete, cards.length]);

  if (loading) {
    return (
      <View style={[styles.overlay, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (remainingCards.length === 0) {
    return null;
  }

  return (
    <View style={[styles.overlay, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg }]}>
      <Pressable style={styles.backdrop} onPress={() => {}} />

      <View style={styles.topRow}>
        <View style={styles.dots}>
          {cards.map((c, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.dot,
                {
                  backgroundColor: i < dismissedCount
                    ? "rgba(255,255,255,0.3)"
                    : i === dismissedCount
                    ? "#FFFFFF"
                    : "rgba(255,255,255,0.5)",
                  width: i === dismissedCount ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.cardContainer}>
        {remainingCards
          .slice(0, 3)
          .reverse()
          .map((card, reversedIndex) => {
            const actualIndex = remainingCards.length <= 3
              ? remainingCards.length - 1 - reversedIndex
              : 2 - reversedIndex;
            return (
              <SwipeableCard
                key={card.id || card.title}
                card={card}
                onDismiss={handleDismiss}
                isTop={actualIndex === 0}
                index={actualIndex}
                totalRemaining={Math.min(remainingCards.length, 3)}
              />
            );
          })}
      </View>

      <Pressable style={styles.skipButton} onPress={onComplete} testID="button-skip-cards">
        <ThemedText type="caption" style={{ color: "rgba(255,255,255,0.7)" }}>
          Skip
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  topRow: {
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  cardContainer: {
    width: CARD_WIDTH + 20,
    height: CARD_HEIGHT + 20,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  watermarkLogo: {
    position: "absolute",
    width: 220,
    height: 220,
    opacity: 0.04,
    right: -30,
    bottom: 40,
  },
  cardImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.12,
  },
  cardContent: {
    flex: 1,
    paddingTop: Spacing["4xl"],
    paddingHorizontal: Spacing["2xl"],
    justifyContent: "center",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    marginBottom: Spacing["2xl"],
  },
  bulletList: {
    gap: Spacing.lg,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    lineHeight: 24,
    fontSize: 16,
  },
  swipeButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["2xl"],
    gap: Spacing.xl,
  },
  swipeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeLabelContainer: {
    alignItems: "center",
    gap: 2,
  },
  promoBanner: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  promoIconRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 6,
  },
  promoText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  skipButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing["3xl"],
  },
});
