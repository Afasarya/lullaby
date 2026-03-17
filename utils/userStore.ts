import * as FileSystem from "expo-file-system";

const USER_FILE = FileSystem.documentDirectory + "lullaby_user.json";
const SLEEP_STOP_FILE = FileSystem.documentDirectory + "lullaby_sleep_stop.json";

const MAX_STOPS_PER_WEEK = 2;

// ── Name ──────────────────────────────────────────────────────────────────

export async function saveName(name: string): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(
      USER_FILE,
      JSON.stringify({ name: name.trim() })
    );
  } catch (e) {
    console.warn("userStore: failed to save name", e);
  }
}

export async function loadName(): Promise<string> {
  try {
    const info = await FileSystem.getInfoAsync(USER_FILE);
    if (!info.exists) return "";
    const content = await FileSystem.readAsStringAsync(USER_FILE);
    const parsed = JSON.parse(content);
    return parsed.name || "";
  } catch {
    return "";
  }
}

// ── Sleep Stop Rate Limit ─────────────────────────────────────────────────

type SleepStopData = {
  count: number;
  weekStart: string; // ISO date string of the Monday of the current week
};

/** Returns the ISO date string (YYYY-MM-DD) of Monday of the given date's week */
function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

async function readSleepStopData(): Promise<SleepStopData> {
  try {
    const info = await FileSystem.getInfoAsync(SLEEP_STOP_FILE);
    if (!info.exists) return { count: 0, weekStart: getMondayOfWeek(new Date()) };
    const content = await FileSystem.readAsStringAsync(SLEEP_STOP_FILE);
    return JSON.parse(content) as SleepStopData;
  } catch {
    return { count: 0, weekStart: getMondayOfWeek(new Date()) };
  }
}

async function writeSleepStopData(data: SleepStopData): Promise<void> {
  await FileSystem.writeAsStringAsync(SLEEP_STOP_FILE, JSON.stringify(data));
}

/**
 * Returns how many stop attempts remain this week.
 * Automatically resets the counter if a new week has started.
 */
export async function getSleepStopRemaining(): Promise<number> {
  const data = await readSleepStopData();
  const currentWeek = getMondayOfWeek(new Date());

  // New week → reset
  if (data.weekStart !== currentWeek) {
    await writeSleepStopData({ count: 0, weekStart: currentWeek });
    return MAX_STOPS_PER_WEEK;
  }

  return Math.max(0, MAX_STOPS_PER_WEEK - data.count);
}

/**
 * Returns true if the user can still stop sleep mode this week.
 */
export async function canStopSleepMode(): Promise<boolean> {
  const remaining = await getSleepStopRemaining();
  return remaining > 0;
}

/**
 * Records one stop attempt. Call this AFTER actually stopping the service.
 */
export async function recordSleepStop(): Promise<void> {
  const data = await readSleepStopData();
  const currentWeek = getMondayOfWeek(new Date());

  const newCount =
    data.weekStart === currentWeek ? data.count + 1 : 1;

  await writeSleepStopData({ count: newCount, weekStart: currentWeek });
}
