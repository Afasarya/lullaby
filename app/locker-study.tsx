import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { BlurView } from "expo-blur";
import AppLocker from "../modules/AppLocker";

const GRACE_OPTIONS = [
  { label: "1 min ⚡", value: 1, isTest: true },
  { label: "20 min", value: 20 },
  { label: "30 min", value: 30 },
  { label: "40 min", value: 40 },
];

export default function LockerStudy() {
  const router = useRouter();
  const [selectedGrace, setSelectedGrace] = useState<1 | 20 | 30 | 40>(20);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setVisibilityAsync("hidden");
    AppLocker.isServiceRunning().then((running) => {
      setIsActive(running);
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = (minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainingSeconds(minutes * 60);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainingSeconds(0);
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await AppLocker.startLockService("study", {
        gracePeriodMinutes: selectedGrace,
      });
      setIsActive(true);
      startCountdown(selectedGrace);
      Alert.alert(
        "Study Mode Active 📚",
        `You have ${selectedGrace} minutes of free access.\nAfter that, your phone will be locked.\n\nStay focused! 🎯`
      );
    } catch (e) {
      Alert.alert("Error", "Failed to start study mode.");
    } finally {
      setLoading(false);
    }
  };

  // Stop tidak diizinkan dari UI — hanya bisa dari notifikasi sistem

  const formatCountdown = (secs: number): string => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.emoji}>📚</Text>
          <Text style={styles.title}>Study Mode</Text>
          <Text style={styles.subtitle}>
            Set a grace period. When it runs out, your phone will be locked automatically.
          </Text>

          {/* Countdown display when active */}
          {isActive && remainingSeconds > 0 && (
            <BlurView intensity={30} tint="dark" style={styles.countdownCard}>
              <Text style={styles.countdownLabel}>Time remaining before lock</Text>
              <Text style={styles.countdownValue}>{formatCountdown(remainingSeconds)}</Text>
              <Text style={styles.countdownSub}>Put the phone down and start studying! 🎯</Text>
            </BlurView>
          )}

          {isActive && remainingSeconds === 0 && (
            <View style={styles.lockedBanner}>
              <Text style={styles.lockedBannerText}>🔒 Phone is now locked!</Text>
            </View>
          )}

          {/* Grace Period Selector */}
          {!isActive && (
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <Text style={styles.cardLabel}>GRACE PERIOD</Text>
              <Text style={styles.cardDesc}>
                How long until the phone locks after you start?
              </Text>
              <View style={styles.graceRow}>
                {GRACE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.graceOption,
                      selectedGrace === opt.value && styles.graceOptionActive,
                      opt.isTest && styles.graceOptionTest,
                    ]}
                    onPress={() => setSelectedGrace(opt.value as 1 | 20 | 30 | 40)}
                  >
                    <Text
                      style={[
                        styles.graceOptionText,
                        selectedGrace === opt.value && styles.graceOptionTextActive,
                        opt.isTest && styles.graceOptionTestText,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          )}

          {/* Start Button - hanya tampil saat tidak aktif */}
          {!isActive && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStart}
              disabled={loading}
            >
              <Text style={styles.startButtonText}>
                {loading
                  ? "Starting..."
                  : selectedGrace === 1
                  ? "▶ Start Study Mode (1 min – Test)"
                  : `▶ Start Study Mode (${selectedGrace} min)`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Testing tip */}
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Testing Tip</Text>
            <Text style={styles.tipText}>
              For a 2-min test: select 20 min grace, then start. Open another app after it locks (timer hits 0).
              {"\n\n"}Emergency stop: pull down notification bar → tap "Stop" on the Lullaby notification.
            </Text>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
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

  countdownCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201,164,231,0.4)",
    backgroundColor: "rgba(60,20,100,0.5)",
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },

  countdownLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },

  countdownValue: {
    color: "white",
    fontSize: 56,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginBottom: 8,
  },

  countdownSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    textAlign: "center",
  },

  lockedBanner: {
    backgroundColor: "rgba(200,50,50,0.7)",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
  },

  lockedBannerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(30,10,60,0.4)",
    padding: 20,
  },

  cardLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  cardDesc: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginBottom: 18,
  },

  graceRow: {
    flexDirection: "row",
    gap: 10,
  },

  graceOption: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  graceOptionActive: {
    backgroundColor: "rgba(201,164,231,0.3)",
    borderColor: "#C9A4E7",
  },

  graceOptionText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontWeight: "600",
  },

  graceOptionTextActive: {
    color: "white",
  },

  graceOptionTest: {
    borderColor: "rgba(255,213,79,0.5)",
    backgroundColor: "rgba(255,213,79,0.08)",
  },

  graceOptionTestText: {
    color: "#FFD54F",
  },

  startButton: {
    backgroundColor: "#4EC9B0",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },

  startButtonText: {
    color: "#1A2A2A",
    fontSize: 16,
    fontWeight: "700",
  },

  stopButton: {
    backgroundColor: "rgba(200,50,50,0.8)",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },

  stopButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  tipCard: {
    backgroundColor: "rgba(78,201,176,0.1)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(78,201,176,0.25)",
  },

  tipTitle: {
    color: "#4EC9B0",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },

  tipText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    lineHeight: 18,
  },
});
