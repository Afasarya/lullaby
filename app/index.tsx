import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import * as NavigationBar from "expo-navigation-bar";
import { saveName, loadName } from "../utils/userStore";

export default function Index() {
  const [name, setName] = useState("");
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setVisibilityAsync("hidden");

    // Kalau nama sudah disimpan sebelumnya, langsung ke home
    loadName().then((savedName) => {
      if (savedName) {
        router.replace("/home");
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await saveName(name.trim());

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/home");
    });
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ImageBackground
        source={{
          uri: "https://wallpapers.com/images/high/mixed-media-van-gogh-starry-night-window-uwyzlfcofsupmgw3.webp",
        }}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Blur Layer */}
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to Lullaby,</Text>

            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="rgba(232,222,248,0.5)"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Let's get started</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    width: "80%",
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 40,
    marginBottom: 40,
    textAlign: "center",
  },

  input: {
    borderBottomWidth: 4,
    borderBottomColor: "#E8DEF8",
    color: "white",
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 16,
    width: "100%",
    marginBottom: 50,
  },

  button: {
    backgroundColor: "#E4C0F7",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
  },

  buttonText: {
    color: "#3F3041",
    fontSize: 14,
  },
});