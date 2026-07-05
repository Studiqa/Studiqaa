import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

export default function MindMapCreateScreen() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      // Same callable the web app uses — App Check on mobile would use Play
      // Integrity / App Attest providers instead of reCAPTCHA (not wired yet;
      // see functions/README notes on mobile App Check setup before shipping).
      const generateMindMap = httpsCallable<{ topic: string }, { mapId: string }>(getFunctions(getApp()), "generateMindMap");
      const result = await generateMindMap({ topic });
      Alert.alert("Mind map created", `ID: ${result.data.mapId}`);
    } catch (err: any) {
      Alert.alert("Couldn't generate", err?.code === "functions/resource-exhausted"
        ? "You've reached your free mind-map limit this month."
        : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a mind map</Text>
      <TextInput style={styles.input} placeholder="Topic name" placeholderTextColor="#777" value={topic} onChangeText={setTopic} />
      <TouchableOpacity style={styles.button} onPress={handleGenerate} disabled={loading || !topic.trim()}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0D10", padding: 24 },
  title: { color: "#EDEDED", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  input: { backgroundColor: "#15181C", color: "#EDEDED", padding: 14, borderRadius: 12, marginBottom: 12 },
  button: { backgroundColor: "#5B5EF4", padding: 14, borderRadius: 12 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
