import React, { useState, useCallback } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;

interface WelcomeCardData {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  color: string;
}

const CARDS: WelcomeCardData[] = [
  {
    icon: "compass",
    title: "Discover SA Families",
    description:
      "Find other South African families living near you in New Zealand. Connect over shared interests and life stages.",
    color: "#E8703A",
  },
  {
    icon: "calendar",
    title: "Join Community Events",
    description:
      "Braais, playdates, rugby watch parties, and more. Browse and RSVP to events created by families in your area.",
    color: "#1A7F7F",
  },
  {
    icon: "message-circle",
    title: "Stay Connected",
    description:
      "Send connection requests and chat privately with families you click with. Build your SA community in NZ!",
    color: "#F5A623",
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
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const stackOffset = Math.min(index, 2);

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-12, 0, 12],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 300 });
        rotate.value = withTiming(direction * 25, { duration: 300 });
        opacity.value = withTiming(0, { duration: 250 }, () => {
          runOnJS(dismiss)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        rotate.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    if (isTop) {
      return {
        transform: [
          { translateX: translateX.value },
          { rotate: `${rotate.value}deg` },
          { scale: 1 },
          { translateY: 0 },
        ],
        opacity: opacity.value,
      };
    }
    return {
      transform: [
        { translateX: 0 },
        { rotate: "0deg" },
        { scale: 1 - stackOffset * 0.04 },
        { translateY: stackOffset * 12 },
      ],
      opacity: 1 - stackOffset * 0.12,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundDefault,
            zIndex: totalRemaining - index,
          },
          animatedCardStyle,
        ]}
      >
        <View style={styles.cardInner}>
          <View style={[styles.iconCircle, { backgroundColor: card.color + "18" }]}>
            <Feather name={card.icon} size={48} color={card.color} />
          </View>
          <ThemedText type="h2" style={styles.cardTitle}>
            {card.title}
          </ThemedText>
          <ThemedText type="body" style={[styles.cardDescription, { color: theme.textSecondary }]}>
            {card.description}
          </ThemedText>
        </View>
        {isTop ? (
          <View style={styles.swipeHint}>
            <Feather name="chevrons-left" size={18} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Swipe to continue
            </ThemedText>
            <Feather name="chevrons-right" size={18} color={theme.textSecondary} />
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
  const [dismissedCount, setDismissedCount] = useState(0);

  const remainingCards = CARDS.slice(dismissedCount);

  const handleDismiss = useCallback(() => {
    setDismissedCount((prev) => {
      const next = prev + 1;
      if (next >= CARDS.length) {
        setTimeout(() => onComplete(), 100);
      }
      return next;
    });
  }, [onComplete]);

  if (remainingCards.length === 0) {
    return null;
  }

  return (
    <View style={[styles.overlay, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg }]}>
      <Pressable style={styles.backdrop} onPress={() => {}} />

      <View style={styles.counter}>
        <ThemedText type="body" style={{ color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>
          {dismissedCount + 1} of {CARDS.length}
        </ThemedText>
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
                key={card.title}
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
        <ThemedText type="body" style={{ color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>
          Skip all
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  counter: {
    marginBottom: Spacing.lg,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["3xl"],
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  cardTitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  cardDescription: {
    textAlign: "center",
    lineHeight: 26,
    fontSize: 17,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    opacity: 0.6,
  },
  skipButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["3xl"],
  },
});
