import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BusinessHubScreen from "@/screens/BusinessHubScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type BusinessStackParamList = {
  BusinessHub: undefined;
};

const Stack = createNativeStackNavigator<BusinessStackParamList>();

export default function BusinessStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="BusinessHub"
        component={BusinessHubScreen}
        options={{ headerTitle: "Business Hub" }}
      />
    </Stack.Navigator>
  );
}
