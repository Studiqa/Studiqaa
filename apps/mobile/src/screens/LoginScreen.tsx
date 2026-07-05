import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth(), email, password);
      // Navigation switches automatically via RootNavigator's onAuthStateChanged listener.
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Studiqa</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#777" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#777" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0D10", padding: 24, justifyContent: "center" },
  title: { color: "#EDEDED", fontSize: 32, fontWeight: "700", marginBottom: 32, textAlign: "center" },
  input: { backgroundColor: "#15181C", color: "#EDEDED", padding: 14, borderRadius: 12, marginBottom: 12 },
  button: { backgroundColor: "#5B5EF4", padding: 14, borderRadius: 12, marginTop: 8 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  error: { color: "#e05252", marginTop: 12, textAlign: "center" },
});
