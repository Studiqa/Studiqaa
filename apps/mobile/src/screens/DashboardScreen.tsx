import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { checkLimit } from "@studiqa/usage-limits";
import type { User } from "@studiqa/types";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export default function DashboardScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth(), (fbUser) => {
      if (!fbUser) return;
      return onSnapshot(doc(db(), "users", fbUser.uid), (snap) => {
        if (snap.exists()) setUser({ uid: fbUser.uid, ...(snap.data() as Omit<User, "uid">) });
      });
    });
  }, []);

  if (!user) return <View style={styles.container}><Text style={styles.text}>Loading…</Text></View>;

  const mindMapLimit = checkLimit(user, "mindMaps");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back, {user.displayName}</Text>
      <Text style={styles.text}>🔥 Streak: {user.streakCount} days</Text>
      <Text style={styles.text}>
        Mind maps this month: {user.usageCounters.mindMapsThisMonth}
        {mindMapLimit.isPremium ? " (unlimited)" : ` / ${mindMapLimit.limit}`}
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MindMapCreate")}>
        <Text style={styles.buttonText}>+ New mind map</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signOut} onPress={() => signOut(auth())}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0D10", padding: 24 },
  title: { color: "#EDEDED", fontSize: 24, fontWeight: "700", marginBottom: 16 },
  text: { color: "#EDEDED", marginBottom: 8 },
  button: { backgroundColor: "#5B5EF4", padding: 14, borderRadius: 12, marginTop: 24 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  signOut: { marginTop: 16 },
  signOutText: { color: "#e05252", textAlign: "center" },
});
