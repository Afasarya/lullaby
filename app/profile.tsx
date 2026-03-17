import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import HomeBar from "../components/HomeBar";
import { loadName, saveName } from "../utils/userStore";

export default function Profile() {
  const [name, setName] = useState("Guest");
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setVisibilityAsync("hidden");
    loadName().then((saved) => {
      if (saved) setName(saved);
    });
  }, []);

  const handleEdit = () => {
    setEditValue(name);
    setEditMode(true);
  };

  const handleSave = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      Alert.alert("Name cannot be empty");
      return;
    }
    await saveName(trimmed);
    setName(trimmed);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditValue("");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://wallpapers.com/images/high/mixed-media-van-gogh-starry-night-window-uwyzlfcofsupmgw3.webp",
        }}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.kav}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Your Profile</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Name</Text>

              {editMode ? (
                <>
                  <TextInput
                    value={editValue}
                    onChangeText={setEditValue}
                    style={styles.input}
                    autoFocus
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    selectionColor="#E8DEF8"
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                  />
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.name}>{name}</Text>
                  <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                    <Text style={styles.editBtnText}>✏️ Edit Name</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

        <HomeBar />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  background: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
  },

  kav: {
    flex: 1,
    justifyContent: "center",
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },

  title: {
    fontSize: 30,
    color: "white",
    marginBottom: 40,
  },

  card: {
    width: "90%",
    backgroundColor: "rgba(200,162,255,0.6)",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },

  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },

  name: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#E8DEF8",
    color: "white",
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 22,
    width: "100%",
    marginBottom: 20,
    fontWeight: "bold",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  saveBtn: {
    backgroundColor: "#E4C0F7",
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 14,
  },

  saveBtnText: {
    color: "#3F1F5A",
    fontWeight: "700",
    fontSize: 15,
  },

  cancelBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },

  cancelBtnText: {
    color: "white",
    fontSize: 15,
  },

  editBtn: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  editBtnText: {
    color: "white",
    fontSize: 13,
  },
});
