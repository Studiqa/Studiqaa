import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import MindMapCreateScreen from "../screens/MindMapCreateScreen";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  MindMapCreate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => onAuthStateChanged(auth(), (user) => setSignedIn(!!user)), []);

  if (signedIn === null) return null; // splash could go here

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#0B0D10" }, headerTintColor: "#EDEDED" }}>
      {!signedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log in" }} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="MindMapCreate" component={MindMapCreateScreen} options={{ title: "New mind map" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
