import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: "#D84315",
    secondary: "#00796B",
    accent: "#FFA726",
    text: "#3E2723",
    textSecondary: "#795548",
    buttonText: "#FFFFFF",
    tabIconDefault: "#795548",
    tabIconSelected: "#D84315",
    link: "#D84315",
    backgroundRoot: "#F5F3F0",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#FAF9F7",
    backgroundTertiary: "#F0EDE8",
    border: "#D7CCC8",
    error: "#C62828",
    success: "#388E3C",
    cardShadow: "rgba(0, 0, 0, 0.08)",
  },
  dark: {
    primary: "#FF7043",
    secondary: "#4DB6AC",
    accent: "#FFB74D",
    text: "#F5F3F0",
    textSecondary: "#BCAAA4",
    buttonText: "#FFFFFF",
    tabIconDefault: "#BCAAA4",
    tabIconSelected: "#FF7043",
    link: "#FF7043",
    backgroundRoot: "#2A2420",
    backgroundDefault: "#3E332D",
    backgroundSecondary: "#4A3F38",
    backgroundTertiary: "#564B43",
    border: "#5D524A",
    error: "#EF5350",
    success: "#66BB6A",
    cardShadow: "rgba(0, 0, 0, 0.3)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  titleLarge: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  heading: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Poppins_400Regular",
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    fontFamily: "Poppins_400Regular",
  },
  small: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "400" as const,
    fontFamily: "Poppins_400Regular",
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHover: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    semibold: "Poppins_600SemiBold",
    bold: "Poppins_700Bold",
  },
  default: {
    sans: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    semibold: "Poppins_600SemiBold",
    bold: "Poppins_700Bold",
  },
  web: {
    sans: "Poppins_400Regular, system-ui, sans-serif",
    medium: "Poppins_500Medium, system-ui, sans-serif",
    semibold: "Poppins_600SemiBold, system-ui, sans-serif",
    bold: "Poppins_700Bold, system-ui, sans-serif",
  },
});
