import * as FileSystem from "expo-file-system";

const USER_FILE = FileSystem.documentDirectory + "lullaby_user.json";

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
  } catch (e) {
    return "";
  }
}
