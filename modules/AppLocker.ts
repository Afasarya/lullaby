import { NativeModules, Platform } from "react-native";

const { AppLocker: NativeAppLocker } = NativeModules;

export type LockMode = "sleep" | "study" | "work";

export interface SleepModeParams {
  sleepStart: string;
  sleepEnd: string;
}

export interface StudyWorkModeParams {
  gracePeriodMinutes: 1 | 20 | 30 | 40 | 60;
}

export type LockParams = SleepModeParams | StudyWorkModeParams;

const AppLocker = {
  isAndroid: Platform.OS === "android",

  hasUsageStatsPermission(): Promise<boolean> {
    if (!this.isAndroid) return Promise.resolve(false);
    return NativeAppLocker.hasUsageStatsPermission();
  },

  hasOverlayPermission(): Promise<boolean> {
    if (!this.isAndroid) return Promise.resolve(false);
    return NativeAppLocker.hasOverlayPermission();
  },

  openUsageAccessSettings(): Promise<boolean> {
    if (!this.isAndroid) return Promise.resolve(false);
    return NativeAppLocker.openUsageAccessSettings();
  },

  openOverlaySettings(): Promise<boolean> {
    if (!this.isAndroid) return Promise.resolve(false);
    return NativeAppLocker.openOverlaySettings();
  },

  startLockService(mode: LockMode, params: LockParams): Promise<boolean> {
    if (!this.isAndroid) return Promise.resolve(false);
    return NativeAppLocker.startLockService(mode, params);
  },

  stopLockService(): Promise<boolean> {
    if (!this.isAndroid) return Promise.resolve(false);
    return NativeAppLocker.stopLockService();
  },

  isServiceRunning(): Promise<boolean> {
    if (!this.isAndroid) return Promise.resolve(false);
    return NativeAppLocker.isServiceRunning();
  },
};

export default AppLocker;
