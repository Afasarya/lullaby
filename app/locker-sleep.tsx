import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Linking,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { BlurView } from "expo-blur";
import AppLocker from "../modules/AppLocker";

const formatTime = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

const timeToDate = (timeStr: string): Date => {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export default function LockerSleep() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sleepStart, setSleepStart] = useState(timeToDate("22:00"));
  const [sleepEnd, setSleepEnd] = useState(timeToDate("06:00"));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncServiceStatus = useCallback(async () => {
    const running = await AppLocker.isServiceRunning();
    setIsActive(running);
  }, []);

  useEffect(() => {
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  // Re-cek saat screen difokuskan (balik dari background / navigasi)
  useFocusEffect(
    useCallback(() => {
      syncServiceStatus();

      // Polling setiap 10 detik untuk mendeteksi kalau sleep window habis
      pollRef.current = setInterval(syncServiceStatus, 10_000);

      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [syncServiceStatus])
  );

  // Quick Test: set window = now → now+2 minutes
  const handleQuickTest = () => {
    const now = new Date();
    const end = new Date(now.getTime() + 2 * 60 * 1000);
    setSleepStart(now);
    setSleepEnd(end);
    Alert.alert(
      "⚡ Quick Test Set",
      `Bedtime: ${formatTime(now)}\nWake-up: ${formatTime(end)}\n\nToggle ON to activate — lock will start immediately!`
    );
  };

  const handleToggle = async (val: boolean) => {
    // Hanya bisa diaktifkan (ON), tidak bisa dimatikan dari sini
    if (!val) return;

    setLoading(true);
    try {
      await AppLocker.startLockService("sleep", {
        sleepStart: formatTime(sleepStart),
        sleepEnd: formatTime(sleepEnd),
      });
      setIsActive(true);
      Alert.alert(
        "Sleep Mode Active 🌙",
        `Your phone will be locked from ${formatTime(sleepStart)} to ${formatTime(sleepEnd)}.`
      );
    } catch {
      Alert.alert("Error", "Failed to start sleep mode.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyCall = () => {
    // Buka dialer kosong — user bisa ketik nomor darurat apapun (112, 119, 911, dll)
    Linking.openURL("tel:");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://wallpapers.com/images/high/mixed-media-van-gogh-starry-night-window-uwyzlfcofsupmgw3.webp",
        }}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.emoji}>🌙</Text>
          <Text style={styles.title}>Sleep Mode</Text>
          <Text style={styles.subtitle}>
            Lock your phone during sleep hours. All apps will be blocked in the set time range.
          </Text>

          {/* Time Cards */}
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <Text style={styles.cardLabel}>SLEEP TIME</Text>
            <TouchableOpacity
              style={styles.timeRow}
              onPress={() => setShowStartPicker(true)}
              disabled={isActive}
            >
              <Text style={styles.timeEmoji}>😴</Text>
              <View style={styles.timeTextGroup}>
                <Text style={styles.timeLabel}>Bedtime</Text>
                <Text style={styles.timeValue}>{formatTime(sleepStart)}</Text>
              </View>
              {!isActive && <Text style={styles.timeChevron}>›</Text>}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.timeRow}
              onPress={() => setShowEndPicker(true)}
              disabled={isActive}
            >
              <Text style={styles.timeEmoji}>☀️</Text>
              <View style={styles.timeTextGroup}>
                <Text style={styles.timeLabel}>Wake-up time</Text>
                <Text style={styles.timeValue}>{formatTime(sleepEnd)}</Text>
              </View>
              {!isActive && <Text style={styles.timeChevron}>›</Text>}
            </TouchableOpacity>
          </BlurView>

          {/* Quick Test button */}
          {!isActive && (
            <TouchableOpacity style={styles.quickTestBtn} onPress={handleQuickTest}>
              <Text style={styles.quickTestText}>⚡ Quick Test (2 min window)</Text>
            </TouchableOpacity>
          )}

          {/* Duration info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              📱 All apps will be locked from{" "}
              <Text style={styles.infoHighlight}>{formatTime(sleepStart)}</Text>
              {" "}until{" "}
              <Text style={styles.infoHighlight}>{formatTime(sleepEnd)}</Text>
            </Text>
          </View>

          {/* Toggle */}
          <BlurView intensity={20} tint="dark" style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Sleep Mode</Text>
                <Text style={styles.toggleSubLabel}>
                  {isActive
                    ? "Active – phone locked during sleep hours"
                    : "Tap to activate"}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={handleToggle}
                disabled={loading || isActive}
                trackColor={{ false: "#555", true: "#C9A4E7" }}
                thumbColor={isActive ? "#fff" : "#aaa"}
              />
            </View>
          </BlurView>

          {/* Emergency Call button — selalu tampil */}
          <TouchableOpacity
            style={styles.emergencyBtn}
            onPress={handleEmergencyCall}
            activeOpacity={0.8}
          >
            <Text style={styles.emergencyIcon}>🚨</Text>
            <View style={styles.emergencyTextGroup}>
              <Text style={styles.emergencyTitle}>Emergency Call</Text>
              <Text style={styles.emergencySubtitle}>Buka dialer – ketik nomor darurat sendiri</Text>
            </View>
          </TouchableOpacity>

          {/* Testing note */}
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Testing Tip</Text>
            <Text style={styles.tipText}>
              For a quick 2-min test: tap ⚡ Quick Test, then toggle ON.
              Open another app – the lock screen will appear automatically.
            </Text>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* DateTimePickers */}
        {showStartPicker && (
          <DateTimePicker
            value={sleepStart}
            mode="time"
            is24Hour={true}
            display={Platform.OS === "android" ? "clock" : "spinner"}
            onChange={(_, date) => {
              setShowStartPicker(false);
              if (date) setSleepStart(date);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={sleepEnd}
            mode="time"
            is24Hour={true}
            display={Platform.OS === "android" ? "clock" : "spinner"}
            onChange={(_, date) => {
              setShowEndPicker(false);
              if (date) setSleepEnd(date);
            }}
          />
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },

  backButton: { marginBottom: 20 },
  backText: { color: "#C9A4E7", fontSize: 18 },

  emoji: { fontSize: 56, textAlign: "center", marginBottom: 12 },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 20,
  },

  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(30,10,60,0.4)",
  },

  cardLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },

  timeEmoji: { fontSize: 28 },
  timeTextGroup: { flex: 1 },

  timeLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginBottom: 2,
  },

  timeValue: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
  },

  timeChevron: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 28,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 20,
  },

  infoCard: {
    backgroundColor: "rgba(123,94,167,0.3)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(201,164,231,0.3)",
  },

  infoText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  infoHighlight: {
    color: "#C9A4E7",
    fontWeight: "700",
  },

  toggleCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(30,10,60,0.4)",
    marginBottom: 16,
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },

  toggleLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  toggleSubLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    maxWidth: 220,
  },

  quickTestBtn: {
    backgroundColor: "rgba(255,213,79,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,213,79,0.4)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 12,
  },

  quickTestText: {
    color: "#FFD54F",
    fontSize: 14,
    fontWeight: "600",
  },

  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220,38,38,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(220,38,38,0.6)",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 14,
  },

  emergencyIcon: {
    fontSize: 30,
  },

  emergencyTextGroup: {
    flex: 1,
  },

  emergencyTitle: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },

  emergencySubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
  },

  tipCard: {
    backgroundColor: "rgba(78,201,176,0.15)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(78,201,176,0.3)",
  },

  tipTitle: {
    color: "#4EC9B0",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },

  tipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    lineHeight: 18,
  },
});
