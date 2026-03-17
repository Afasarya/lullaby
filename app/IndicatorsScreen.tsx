import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import * as NavigationBar from "expo-navigation-bar";
import HomeBar from "../components/HomeBar";

const screenWidth = Dimensions.get("window").width;

const ESP_IP = "172.23.83.73"; // Updated IP

type SensorData = {
  temperature: number;
  humidity: number;
  pressure: number;
  co2: number;
};

export default function IndicatorsScreen() {
  const [temperature, setTemperature] = useState<number[]>([]);
  const [humidity, setHumidity] = useState<number[]>([]);
  const [pressure, setPressure] = useState<number[]>([]);
  const [co2, setCo2] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  console.log("📊 IndicatorsScreen rendered");

  const fetchSensor = async () => {
    console.log("🔄 Fetching sensor data from ESP32...");
    try {
      setConnectionStatus('connecting');
      const res = await fetch(`http://${ESP_IP}/sensor`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: SensorData = await res.json();
      console.log("✅ Sensor data received:", data);

      setTemperature(prev => [...prev.slice(-6), data.temperature]);
      setHumidity(prev => [...prev.slice(-6), data.humidity]);
      setPressure(prev => [...prev.slice(-6), data.pressure]);
      setCo2(prev => [...prev.slice(-6), data.co2]);
      setIsLoading(false);
      setConnectionStatus('connected');
    } catch (error) {
      console.log("❌ ESP connection error", error);
      setConnectionStatus('disconnected');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("🎮 Setting up Android navigation bar");
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  useEffect(() => {
    console.log("⏱️ Setting up sensor fetch interval (every 2s)");
    fetchSensor();
    const interval = setInterval(fetchSensor, 2000);
    return () => {
      console.log("🧹 Cleaning up sensor fetch interval");
      clearInterval(interval);
    };
  }, []);

  return (
    <ImageBackground
      source={{
        uri: "https://wallpapers.com/images/high/mixed-media-van-gogh-starry-night-window-uwyzlfcofsupmgw3.webp",
      }}
      resizeMode="cover"
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollView}>
        
        <Text style={styles.title}>Indicators</Text>

        {isLoading && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>⏳ ESP32 Status: Connecting...</Text>
            <Text style={styles.statusSubtext}>Attempting to connect to {ESP_IP}</Text>
          </View>
        )}

        {!isLoading && connectionStatus === 'disconnected' && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>📡 ESP32 Status: Disconnected</Text>
            <Text style={styles.statusSubtext}>Please check your ESP32 connection and IP address ({ESP_IP})</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => {
              setIsLoading(true);
              fetchSensor();
            }}>
              <Text style={styles.retryText}>🔄 Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && connectionStatus === 'connected' && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>✅ ESP32 Status: Connected</Text>
          </View>
        )}

        {/* TEMPERATURE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Temperature</Text>
          <LineChart
            data={{
              labels: temperature.length ? ["1","2","3","4","5","6"].slice(-temperature.length) : ["0"],
              datasets: [{ data: temperature.length ? temperature : [0] }],
            }}
            width={screenWidth - 80}
            height={150}
            withDots={false}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: () => "#7CC4C2",
              labelColor: () => "#555",
            }}
            style={styles.chart}
          />
        </View>

        {/* HUMIDITY */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Humidity</Text>
          <LineChart
            data={{
              labels: humidity.length ? ["1","2","3","4","5","6"].slice(-humidity.length) : ["0"],
              datasets: [{ data: humidity.length ? humidity : [0] }],
            }}
            width={screenWidth - 80}
            height={150}
            withDots={false}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: () => "#FF6B6B",
              labelColor: () => "#555",
            }}
            style={styles.chart}
          />
        </View>

        {/* PRESSURE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pressure</Text>
          <LineChart
            data={{
              labels: pressure.length ? ["1","2","3","4","5","6"].slice(-pressure.length) : ["0"],
              datasets: [{ data: pressure.length ? pressure : [0] }],
            }}
            width={screenWidth - 80}
            height={150}
            withDots={false}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: () => "#4ECDC4",
              labelColor: () => "#555",
            }}
            style={styles.chart}
          />
        </View>

        {/* CO2 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CO₂ level</Text>
          <LineChart
            data={{
              labels: co2.length ? ["1","2","3","4","5","6"].slice(-co2.length) : ["0"],
              datasets: [{ data: co2.length ? co2 : [0] }],
            }}
            width={screenWidth - 80}
            height={150}
            withDots={false}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: () => "#8A78D6",
              labelColor: () => "#555",
            }}
            style={styles.chart}
          />
        </View>

      </ScrollView>
      <HomeBar />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1,
    position: 'relative',
  },
  container: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 38,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 15,
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  chart: {
    borderRadius: 16,
  },
  statusCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  statusSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#C9A4E7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});