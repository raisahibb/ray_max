import sys
import re

with open('c:/RAYMAX/README.md', 'r', encoding='utf-8') as f:
    content = f.read()

new_code = r'''```cpp
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <HTTPClient.h>

// Provide the token generation process info.
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ================== PINS ==================
#define LDR_TOP     34
#define LDR_BOTTOM  35
#define LDR_LEFT    32
#define LDR_RIGHT   33
#define SOLAR_PIN   36
#define SERVO_X     18
#define SERVO_Y     19

Servo servoX;
Servo servoY;

// ================== FIREBASE ==================
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

#define API_KEY "AIzaSyDmF5Daj9wVqykkMMjvRktLMpfkt1LxY9k"
#define DATABASE_URL "https://ray-max-default-rtdb.asia-southeast1.firebasedatabase.app"

// ⚡ FIX: Use two separate FirebaseData objects (one for stream, one for sending data)
FirebaseData streamFbdo;
FirebaseData dataFbdo;

FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

// ================== VARIABLES ==================
int angleX = 90;
int angleY = 90;
bool autoMode = false;
String trackingMode = "MANUAL";

// SUN DATA
float latitude = 0, longitude = 0;
float azimuth = 0, elevation = 0;
bool locationFetched = false;

// TIMERS
unsigned long lastRead = 0;
unsigned long lastPrint = 0;

// AVG STORAGE
long sumTop = 0, sumBottom = 0, sumLeft = 0, sumRight = 0;
int count = 0;

// Current LDR values for Web Dashboard
int currentTop = 0, currentBottom = 0, currentLeft = 0, currentRight = 0;

// ================== FUNCTIONS ==================

int readLDR(int pin) {
  long sum = 0;
  for (int i = 0; i < 5; i++) {
    sum += analogRead(pin);
    delayMicroseconds(300);
  }
  return sum / 5;
}

float readSolarVoltage() {
  int raw = analogRead(SOLAR_PIN);
  float v = raw * (3.3 / 4095.0);
  return v * (14.7 / 4.7);
}

// LOCATION
void getLocation() {
  HTTPClient http;
  http.begin("http://ip-api.com/json");
  if (http.GET() == 200) {
    StaticJsonDocument<300> doc;
    deserializeJson(doc, http.getString());
    latitude = doc["lat"];
    longitude = doc["lon"];
    locationFetched = true;
    Serial.println("📍 Location fetched");
  }
  http.end();
}

// SUN POSITION
void getSunPosition() {
  String url = "https://api.open-meteo.com/v1/forecast?latitude=" +
               String(latitude) +
               "&longitude=" + String(longitude) +
               "&hourly=solar_elevation,solar_azimuth";
  HTTPClient http;
  http.begin(url);
  if (http.GET() == 200) {
    StaticJsonDocument<2000> doc;
    deserializeJson(doc, http.getString());
    azimuth = doc["hourly"]["solar_azimuth"][0];
    elevation = doc["hourly"]["solar_elevation"][0];
  }
  http.end();
}

void moveFromSun() {
  angleY = map(azimuth, 0, 360, 0, 180);
  angleX = map(elevation, 0, 90, 0, 140);
  angleX = constrain(angleX, 0, 140);
  angleY = constrain(angleY, 10, 180);
  servoX.write(angleX);
  servoY.write(angleY);
}

// Firebase Stream Callback (Listens to website commands)
void streamCallback(FirebaseStream data) {
  if (data.dataType() == "json") {
    FirebaseJson *json = data.jsonObjectPtr();
    FirebaseJsonData result;
    
    json->get(result, "cmd");
    String cmd = result.stringValue;
    
    if (cmd == "auto") {
      autoMode = true;
      trackingMode = "AUTO";
      Serial.println("⚡ AUTO MODE ON (via Cloud)");
    } else if (cmd == "move") {
      autoMode = false;
      trackingMode = "MANUAL";
      
      json->get(result, "tilt");
      int t = result.intValue;
      
      json->get(result, "azimuth");
      int a = result.intValue;
      
      angleX = constrain(t, 0, 140);
      angleY = constrain(a, 10, 180);
      
      servoX.write(angleX);
      servoY.write(angleY);
      Serial.printf("🎛 Manual Move (via Cloud) → X:%d Y:%d\n", angleX, angleY);
    }
  }
}

void streamTimeoutCallback(bool timeout) {
  if (timeout) Serial.println("Firebase Stream timeout, reconnecting...");
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);

  servoX.attach(SERVO_X);
  servoY.attach(SERVO_Y);
  servoX.write(angleX);
  servoY.write(angleY);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected");
  
  // Fetch Location BEFORE Firebase connects to save heap memory
  getLocation();

  // Init Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Use Email & Password Auth
  auth.user.email = "YOUR_REGISTERED_EMAIL";
  auth.user.password = "YOUR_REGISTERED_PASSWORD";
  signupOK = true;

  config.token_status_callback = tokenStatusCallback;
  
  // Small optimization for memory
  streamFbdo.setBSSLBufferSize(2048, 1024);
  dataFbdo.setBSSLBufferSize(2048, 1024);
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Start listening to "/commands" using streamFbdo
  if (!Firebase.RTDB.beginStream(&streamFbdo, "/commands")) {
    Serial.printf("❌ Stream begin error: %s\n", streamFbdo.errorReason().c_str());
  }
  Firebase.RTDB.setStreamCallback(&streamFbdo, streamCallback, streamTimeoutCallback);

  Serial.println("🚀 SYSTEM READY (IoT Cloud Mode)");
}

// ================== LOOP ==================
void loop() {
  
  // ===== AUTO TRACKING =====
  if (autoMode && millis() - lastRead >= 200) {
    currentTop = readLDR(LDR_TOP);
    currentBottom = readLDR(LDR_BOTTOM);
    currentLeft = readLDR(LDR_LEFT);
    currentRight = readLDR(LDR_RIGHT);

    sumTop += currentTop;
    sumBottom += currentBottom;
    sumLeft += currentLeft;
    sumRight += currentRight;

    count++;

    if (count >= 50) {
      int top = sumTop / count;
      int bottom = sumBottom / count;
      int left = sumLeft / count;
      int right = sumRight / count;

      bool ldrFail = false;
      if (abs(top - bottom) < 50 && abs(left - right) < 50) {
        ldrFail = true;
      }

      if (!ldrFail) {
        // LDR MODE
        int threshold = 80;
        int step = 8;
        if (top > bottom + threshold) angleX -= step;
        else if (bottom > top + threshold) angleX += step;
        if (left > right + threshold) angleY -= step;
        else if (right > left + threshold) angleY += step;

        angleX = constrain(angleX, 0, 140);
        angleY = constrain(angleY, 10, 180);

        servoX.write(angleX);
        servoY.write(angleY);
        trackingMode = "LDR";
      } else {
        // SUN MODE
        if (locationFetched) {
          getSunPosition();
          moveFromSun();
          trackingMode = "SUN";
        }
      }

      sumTop = sumBottom = sumLeft = sumRight = 0;
      count = 0;
    }
    lastRead = millis();
  }

  // ===== TELEMETRY PUSH TO CLOUD (1 Hz) =====
  if (millis() - lastPrint >= 1000) {
    float volt = readSolarVoltage();
    
    if (!autoMode) {
        currentTop = readLDR(LDR_TOP);
        currentBottom = readLDR(LDR_BOTTOM);
        currentLeft = readLDR(LDR_LEFT);
        currentRight = readLDR(LDR_RIGHT);
    }

    if (Firebase.ready() && signupOK) {
      // Build JSON document
      FirebaseJson json;
      json.set("ldr_top", currentTop);
      json.set("ldr_bottom", currentBottom);
      json.set("ldr_left", currentLeft);
      json.set("ldr_right", currentRight);
      json.set("solar_voltage", volt);
      json.set("temperature", 28.5 + random(-10, 10) / 10.0);
      json.set("tilt", angleX);
      json.set("azimuth", angleY);
      json.set("tracking_mode", trackingMode);
      
      // Push to RTDB /telemetry node using dataFbdo (NOT streamFbdo)
      Firebase.RTDB.setJSONAsync(&dataFbdo, "/telemetry", &json);
    }

    Serial.printf("Mode:%s | Track:%s | X:%d Y:%d | Volt:%.2f\n",
                  autoMode ? "AUTO" : "MANUAL",
                  trackingMode.c_str(),
                  angleX, angleY,
                  volt);
                  
    lastPrint = millis();
  }
}
```'''

new_content = re.sub(r'```cpp.*?```', new_code, content, flags=re.DOTALL)

with open('c:/RAYMAX/README.md', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Replaced cpp block')
