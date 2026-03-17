import { Stack } from "expo-router";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { useRouter, usePathname, Href } from "expo-router";

export default function Layout() {

  useEffect(() => {
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}