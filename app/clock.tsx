import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Switch,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useRef } from "react";
import * as NavigationBar from "expo-navigation-bar";
import HomeBar from "../components/HomeBar";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Alarm = {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
  repeat: boolean[];
};

export default function Clock() {

  const router = useRouter();

  const homeAnim = useRef(new Animated.Value(0)).current;
  const clockAnim = useRef(new Animated.Value(0)).current;
  const planetAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;

  function animateIcon(anim: Animated.Value) {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: -10,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }

  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<string | null>(null);

  // Hide navigation bar
  useEffect(() => {
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  useEffect(() => {
    Notifications.requestPermissionsAsync();

    Notifications.setNotificationChannelAsync("alarm-channel", {
      name: "Alarms",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
    });

  }, []);

  async function scheduleAlarm(alarm: Alarm) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Alarm",
        body: `Alarm for ${formatTime(alarm.hour, alarm.minute)}`,
        sound: true,
      },
      trigger: {
        hour: alarm.hour,
        minute: alarm.minute,
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: "alarm-channel",
      },
    });
  }

  function toggleAlarm(id: string) {
    const updated = alarms.map((alarm) => {
      if (alarm.id === id) {
        const newState = !alarm.enabled;

        if (newState) scheduleAlarm(alarm);

        return { ...alarm, enabled: newState };
      }
      return alarm;
    });

    setAlarms(updated);
  }

  function toggleDay(alarmId: string, index: number) {
    const updated = alarms.map((alarm) => {
      if (alarm.id === alarmId) {
        const newRepeat = [...alarm.repeat];
        newRepeat[index] = !newRepeat[index];
        return { ...alarm, repeat: newRepeat };
      }
      return alarm;
    });

    setAlarms(updated);
  }

  function addAlarm() {
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      hour: 7,
      minute: 0,
      enabled: false,
      repeat: [false, false, false, false, false, false, false],
    };

    setAlarms([...alarms, newAlarm]);
  }

  function openTimePicker(id: string) {
    setSelectedAlarm(id);
    setShowPicker(true);
  }

  function onTimeSelected(event: any, date?: Date) {
    setShowPicker(false);
    if (!date || !selectedAlarm) return;

    const updated = alarms.map((alarm) => {
      if (alarm.id === selectedAlarm) {
        return {
          ...alarm,
          hour: date.getHours(),
          minute: date.getMinutes(),
        };
      }
      return alarm;
    });

    setAlarms(updated);
  }

  function formatTime(hour: number, minute: number) {
    return `${hour.toString().padStart(2, "0")}.${minute
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://wallpapers.com/images/high/mixed-media-van-gogh-starry-night-window-uwyzlfcofsupmgw3.webp",
        }}
        style={styles.background}
        resizeMode="cover"
      >

        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 120 }}
          renderItem={({ item }) => (
            <View style={styles.alarmCard}>

              <TouchableOpacity onPress={() => openTimePicker(item.id)}>
                <Text style={styles.time}>
                  {formatTime(item.hour, item.minute)}
                </Text>
              </TouchableOpacity>

              <View style={styles.repeatRow}>
                {days.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      item.repeat[index] && styles.dayActive,
                    ]}
                    onPress={() => toggleDay(item.id, index)}
                  >
                    <Text style={styles.dayText}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Switch
                value={item.enabled}
                onValueChange={() => toggleAlarm(item.id)}
              />

            </View>
          )}
        />

        {showPicker && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            display="spinner"
            onChange={onTimeSelected}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={addAlarm}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>

      </ImageBackground>
      <HomeBar />
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    position: 'relative',
  },

  alarmCard: {
    marginHorizontal: 30,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(200,162,255,0.6)",
  },

  time: {
    fontSize: 32,
    color: "white",
    marginBottom: 10,
  },

  repeatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  dayButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 5,
    marginBottom: 5,
  },

  dayActive: {
    backgroundColor: "#C9A4E7",
  },

  dayText: {
    color: "white",
    fontSize: 12,
  },

  addButton: {
    position: "absolute",
    bottom: 120,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#C9A4E7",
    justifyContent: "center",
    alignItems: "center",
  },

});