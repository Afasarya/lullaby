import React, { useRef } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { homeBarStyles } from "./HomeBar.styles";

export default function HomeBar() {
  const router = useRouter();
  const pathname = usePathname();

  console.log("🏠 HomeBar rendered - Current path:", pathname);

  const homeAnim = useRef(new Animated.Value(0)).current;
  const clockAnim = useRef(new Animated.Value(0)).current;
  const lockerAnim = useRef(new Animated.Value(0)).current;
  const indicatorsAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;

  const bounce = (anim: Animated.Value) => {
    console.log("⚡ Bounce animation triggered");
    Animated.sequence([
      Animated.timing(anim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNavigation = (path: any, anim: Animated.Value) => {
    console.log("🔗 Navigation clicked:", { from: pathname, to: path });
    bounce(anim);
    try {
      router.push(path);
      console.log("✅ Navigation successful to:", path);
    } catch (error) {
      console.log("❌ Navigation failed:", error);
    }
  };

  const navItem = (
    name: any,
    focusedName: any,
    path: any,
    anim: Animated.Value
  ) => {
    const isActive = pathname === path;
    return (
      <TouchableOpacity
        onPress={() => handleNavigation(path, anim)}
        activeOpacity={0.7}
        style={[
          homeBarStyles.navItem,
          isActive && homeBarStyles.activeNavItem,
        ]}
      >
        <Animated.View style={{ transform: [{ translateY: anim }] }}>
          <Ionicons
            name={isActive ? focusedName : name}
            size={28}
            color={isActive ? "#C9A4E7" : "#FFFFFF"}
            style={homeBarStyles.icon}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={homeBarStyles.bar}>
      {navItem("home-outline", "home", "/home", homeAnim)}
      {navItem("time-outline", "time", "/clock", clockAnim)}
      {navItem("lock-closed-outline", "lock-closed", "/locker", lockerAnim)}
      {navItem("planet-outline", "planet", "/indicators", indicatorsAnim)}
      {navItem("person-outline", "person", "/profile", profileAnim)}
    </View>
  );
}