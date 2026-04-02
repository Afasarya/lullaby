import React, { useEffect, useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { BlurView } from "expo-blur";
import HomeBar from "../components/HomeBar";
import AppLocker from "../modules/AppLocker";

type PermissionStatus = {
  usageStats: boolean;
  overlay: boolean;
};

type ActiveMode = "sleep" | "study" | "work" | null;

export default function Locker() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<PermissionStatus>({
    usageStats: false,
    overlay: false,
  });
  const [activeMode, setActiveMode] = useState<ActiveMode>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  // Re-check permissions every time screen is focused (user may have granted them)
  useFocusEffect(
    useCallback(() => {
      checkPermissions();
      checkServiceStatus();
    }, [])
  );

  const checkPermissions = async () => {
    const usageStats = await AppLocker.hasUsageStatsPermission();
    const overlay = await AppLocker.hasOverlayPermission();
    setPermissions({ usageStats, overlay });
  };

  const checkServiceStatus = async () => {
    const running = await AppLocker.isServiceRunning();
    if (!running) setActiveMode(null);
  };

  const allPermissionsGranted = permissions.usageStats && permissions.overlay;

  const handleStopAll = async () => {
    Alert.alert("Stop All Modes", "Are you sure you want to stop the active mode?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Stop",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          await AppLocker.stopLockService();
          setActiveMode(null);
          setLoading(false);
        },
      },
    ]);
  };

  const ModeCard = ({
    emoji,
    title,
    subtitle,
    route,
    mode,
    color,
  }: {
    emoji: string;
    title: string;
    subtitle: string;
    route: string;
    mode: ActiveMode;
    color: string;
  }) => {
    const isActive = activeMode === mode;
    return (
      <TouchableOpacity
        style={[styles.modeCard, isActive && styles.modeCardActive]}
        onPress={() => {
          if (!allPermissionsGranted) {
            Alert.alert(
              "Permissions Required",
              "Please grant Usage Access and Display Over Other Apps permissions first.",
              [{ text: "OK" }]
            );
            return;
          }
          router.push(route as any);
        }}
        activeOpacity={0.85}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modeCardContent}>
          <View style={[styles.modeIconBg, { backgroundColor: color + "33" }]}>
            <Text style={styles.modeEmoji}>{emoji}</Text>
          </View>
          <View style={styles.modeTextContainer}>
            <Text style={styles.modeTitle}>{title}</Text>
            <Text style={styles.modeSubtitle}>{subtitle}</Text>
          </View>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ON</Text>
            </View>
          )}
          {!isActive && (
            <Text style={styles.arrowText}>›</Text>
          )}
        </View>
      </TouchableOpacity>
    );
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
          <Text style={styles.title}>App Locker</Text>
          <Text style={styles.subtitle}>Choose a focus mode to lock your phone</Text>

          {/* Permission Banner */}
          {!allPermissionsGranted && (
            <View style={styles.permissionBanner}>
              <Text style={styles.permissionTitle}>⚠️ Permissions Needed</Text>
              <Text style={styles.permissionSubtext}>
                Grant these permissions to enable App Locker:
              </Text>
              {!permissions.usageStats && (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={() => AppLocker.openUsageAccessSettings()}
                >
                  <Text style={styles.permissionButtonText}>
                    📊 Grant Usage Access
                  </Text>
                </TouchableOpacity>
              )}
              {!permissions.overlay && (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={() => AppLocker.openOverlaySettings()}
                >
                  <Text style={styles.permissionButtonText}>
                    🪟 Grant Display Over Apps
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.permissionButton, { backgroundColor: "#3F1F5A" }]}
                onPress={checkPermissions}
              >
                <Text style={styles.permissionButtonText}>🔄 Sudah Kasih Izin? Cek Ulang</Text>
              </TouchableOpacity>
            </View>
          )}

          {allPermissionsGranted && (
            <View style={styles.permissionOk}>
              <Text style={styles.permissionOkText}>✅ All permissions granted</Text>
            </View>
          )}

          {/* Mode Cards */}
          <ModeCard
            emoji="🌙"
            title="Sleep Mode"
            subtitle="Lock during sleep hours (e.g. 22:00 – 06:00)"
            route="/locker-sleep"
            mode="sleep"
            color="#7B5EA7"
          />
          <ModeCard
            emoji="📚"
            title="Study Mode"
            subtitle="Grace period 20 / 30 / 40 min before lock"
            route="/locker-study"
            mode="study"
            color="#4EC9B0"
          />
          <ModeCard
            emoji="💼"
            title="Work Mode"
            subtitle="Grace period 30 / 40 / 60 min before lock"
            route="/locker-work"
            mode="work"
            color="#569CD6"
          />

          {/* Stop Button - hanya untuk study/work, sleep mode TIDAK bisa di-stop dari UI */}
          {(activeMode === "study" || activeMode === "work") && (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopAll}
              disabled={loading}
            >
              <Text style={styles.stopButtonText}>
                {loading ? "Stopping..." : "⛔ Stop Active Mode"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        <HomeBar />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  background: { flex: 1 },

  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 38,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
  },

  permissionBanner: {
    backgroundColor: "rgba(255,200,100,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,200,100,0.5)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  permissionTitle: {
    color: "#FFD700",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },

  permissionSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 12,
  },

  permissionButton: {
    backgroundColor: "#C9A4E7",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: "center",
  },

  permissionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  permissionOk: {
    backgroundColor: "rgba(78,201,176,0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },

  permissionOkText: {
    color: "#4EC9B0",
    fontSize: 13,
    fontWeight: "600",
  },

  modeCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(30,10,60,0.5)",
  },

  modeCardActive: {
    borderColor: "#C9A4E7",
    borderWidth: 2,
  },

  modeCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },

  modeIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  modeEmoji: {
    fontSize: 28,
  },

  modeTextContainer: {
    flex: 1,
  },

  modeTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  modeSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    lineHeight: 16,
  },

  activeBadge: {
    backgroundColor: "#C9A4E7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  activeBadgeText: {
    color: "#3F1F5A",
    fontSize: 12,
    fontWeight: "700",
  },

  arrowText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 28,
  },

  stopButton: {
    backgroundColor: "rgba(200,50,50,0.8)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },

  stopButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
