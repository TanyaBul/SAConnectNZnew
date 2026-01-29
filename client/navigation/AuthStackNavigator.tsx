import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "@/screens/WelcomeScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import SignInScreen from "@/screens/SignInScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import CreateProfileScreen from "@/screens/CreateProfileScreen";
import LocationPermissionScreen from "@/screens/LocationPermissionScreen";
import PrivacyPolicyScreen from "@/screens/PrivacyPolicyScreen";
import TermsOfServiceScreen from "@/screens/TermsOfServiceScreen";
import HelpFAQScreen from "@/screens/HelpFAQScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  ForgotPassword: undefined;
  CreateProfile: undefined;
  LocationPermission: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpFAQ: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerTitle: "Sign Up" }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerTitle: "Sign In" }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerTitle: "Reset Password" }}
      />
      <Stack.Screen
        name="CreateProfile"
        component={CreateProfileScreen}
        options={{ headerTitle: "Your Profile" }}
      />
      <Stack.Screen
        name="LocationPermission"
        component={LocationPermissionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerTitle: "Privacy Policy" }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{ headerTitle: "Terms of Service" }}
      />
      <Stack.Screen
        name="HelpFAQ"
        component={HelpFAQScreen}
        options={{ headerTitle: "Help & FAQ" }}
      />
    </Stack.Navigator>
  );
}
