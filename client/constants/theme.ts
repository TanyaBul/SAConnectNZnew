import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: "#0D9488",
    secondary: "#64748B",
    accent: "#06B6D4",
    text: "#1E293B",
    textSecondary: "#64748B",
    buttonText: "#FFFFFF",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#0D9488",
    link: "#0D9488",
    backgroundRoot: "#F8FAFC",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F1F5F9",
    backgroundTertiary: "#E2E8F0",
    border: "#E2E8F0",
    error: "#DC2626",
    success: "#16A34A",
    cardShadow: "rgba(0, 0, 0, 0.06)",
  },
  dark: {
    primary: "#14B8A6",
    secondary: "#94A3B8",
    accent: "#22D3EE",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#64748B",
    tabIconSelected: "#14B8A6",
    link: "#14B8A6",
    backgroundRoot: "#0F172A",
    backgroundDefault: "#1E293B",
    backgroundSecondary: "#334155",
    backgroundTertiary: "#475569",
    border: "#334155",
    error: "#EF4444",
    success: "#22C55E",
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
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHover: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
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
