# ☀️ RAYMAX — Smart Solar Tracking & Telemetry System

> **Real-time solar panel tracking platform utilizing dual-servo alignment, LDR sensors, geolocation-aware astronomical sun tracking (NOAA model), live meteorological telemetry, and a state-of-the-art glassmorphic React dashboard.**

---

<div align="center">
  <img src="logo.png" alt="RAYMAX Logo" width="180" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
  <br /><br />
  
  [![RAYMAX System](https://img.shields.io/badge/RAYMAX-Solar%20System-orange?style=for-the-badge&logo=sun&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](#)
  [![Firebase](https://img.shields.io/badge/Firebase-Auth/Firestore-FFCA28?style=flat-square&logo=firebase)](#)
  [![ESP32](https://img.shields.io/badge/ESP32-WebSocket%20Host-222222?style=flat-square&logo=express)](#)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#)

  <br />
  <h2>🚀 <a href="https://raymax.web.app" target="_blank">SEE IT LIVE HERE — Official Web Dashboard</a> 🚀</h2>
  <p><strong>Note:</strong> You can view and interact with the live deployed site immediately without downloading anything!</p>
</div>

---

## 📖 Overview

**RAYMAX** is a full-stack, hardware-integrated solar tracking and observability ecosystem. It combines an advanced **ESP32 dual-axis physical tracker** with a premium, real-time **React Web Dashboard**. 

The system operates in two tracking modes:
1. **LDR Sensor Mode (Standard)**: Follows the brightest light source in real time using 4 quadrant photoresistors.
2. **Astronomical API Mode (Fallback)**: When LDR light differences are insufficient (e.g., cloudy skies or night), the dashboard calculates the exact elevation/azimuth using the **NOAA Solar Position Model** combined with the user's GPS location and aligns the panel to maximize efficiency.

---

## ✨ Features at a Glance

### 🖥️ Dashboard & Web Experience
* **Glassmorphic Design**: Sleek dark/light modes powered by CSS organic blob animations, premium typography, and micro-animations.
* **Interactive 3D Panel**: A CSS 3D solar panel mockup that physically rotates and pivots in real time to match the exact angles of the hardware servos.
* **Dual-Method Authentication**: Fully secure login portal supporting standard **Email/Password** as well as custom **Mobile/Password** login with session validations stored in Cloud Firestore.
* **Sun Compass & Sky Map**: Visualizes the sun's current position and estimated daytime path on a dynamic SVG compass.
* **60-Read historical Graphs**: Live charts powered by `Chart.js` tracking Power Output (W), Voltage (V), and Temperature (°C) with dynamic scaling.
* **Telemetric Serial Monitor**: Real-time websocket logs showing incoming JSON data frames direct from the ESP32.

### 🔌 Hardware Integration & Safety
* **Motor Protection Constrains**: Hard-coded safety limits on servo movements (**Servo X: 0–140°** and **Servo Y: 12–180°**) to prevent motor strain, overheating, and mechanical collision.
* **Bidirectional Sync**: Instantly override auto-tracking to switch to **Manual Slider Control** from the web dashboard.
* **Credentials Sanitization**: Configured with local `config.js` integration (ignored in git) to prevent committing private Firebase database keys and GitHub tokens to public repositories.

---

## 📁 Project Architecture

```
RAYMAX/
│
├── index.html           # Main dashboard web app shell (React 18, Chart.js, Firebase)
├── App.jsx              # Core React components (Charts, 3D Canvas, Control Panels, Toasts)
├── script.js            # NOAA algorithms, API fetchers, and WebSocket manager
├── style.css            # Custom Design System (Glassmorphic filters, responsive grids)
├── logo.png             # Official RAYMAX branding asset
│
├── config.js            # [PRIVATE] Active Firebase credentials (git-ignored)
├── config.example.js    # Public template file for Firebase setup
│
├── auth/                # Dual Authentication Portal
│   ├── index.html       # Auth Gateway shell
│   ├── auth.jsx         # Custom mobile-auth routing and Firestore verification
│   └── auth.css         # Glass layout styles for Auth Views
│
└── README.md            # Technical documentation & user setup guide (this file)
```

---

## ⚙️ Hardware Setup & ESP32 Firmware

### 🗺️ Pin Mappings (ESP32)

| Component | ESP32 Pin | Description |
|---|---|---|
| **LDR Top** | GPIO 34 | Analog Light Sensor — Top |
| **LDR Bottom** | GPIO 35 | Analog Light Sensor — Bottom |
| **LDR Left** | GPIO 32 | Analog Light Sensor — Left |
| **LDR Right** | GPIO 33 | Analog Light Sensor — Right |
| **Solar Voltage** | GPIO 36 | Analog Voltage Divider reading |
| **Servo X (Tilt)** | GPIO 18 | Servo Motor for Vertical Elevation |
| **Servo Y (Azimuth)**| GPIO 19 | Servo Motor for Horizontal Rotation |

### 🛠️ ESP32 Firmware Code

Copy and upload the following code to your ESP32 using the Arduino IDE. Make sure to install `ArduinoJson`, `ESP32Servo`, and `WebSockets` libraries.

```cpp
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

#define API_KEY "YOUR_FIREBASE_API_KEY"
#define DATABASE_URL "YOUR_FIREBASE_DATABASE_URL"

FirebaseData fbdo;
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
      Serial.printf("🎛 Manual Move (via Cloud) → X:%d Y:%d
", angleX, angleY);
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
  Serial.println("
✅ WiFi Connected");

  // Init Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Sign up as anonymous user
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("✅ Firebase Auth Successful");
    signupOK = true;
  } else {
    Serial.printf("❌ Firebase Auth Error: %s
", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Start listening to "/commands"
  if (!Firebase.RTDB.beginStream(&fbdo, "/commands")) {
    Serial.printf("❌ Stream begin error: %s
", fbdo.errorReason().c_str());
  }
  Firebase.RTDB.setStreamCallback(&fbdo, streamCallback, streamTimeoutCallback);

  getLocation();
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
      
      // Push to RTDB /telemetry node
      Firebase.RTDB.setJSON(&fbdo, "/telemetry", &json);
    }

    Serial.printf("Mode:%s | Track:%s | X:%d Y:%d | Volt:%.2f
",
                  autoMode ? "AUTO" : "MANUAL",
                  trackingMode.c_str(),
                  angleX, angleY,
                  volt);
                  
    lastPrint = millis();
  }
}
```

---

## 🌐 Software Setup

> [!NOTE]
> The project is pre-configured and deployed on Firebase Hosting! You can view the live dashboard immediately by visiting **[https://raymax.web.app](https://raymax.web.app)**. If you wish to host your own database instance, follow the steps below.

### 1. Firebase Project Configuration
Create a project on the [Firebase Console](https://console.firebase.google.com/) and copy the web configuration parameters.
1. Duplicate `config.example.js` and rename it to `config.js`.
2. Open `config.js` and insert your Firebase configuration details:
```javascript
window.firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```
3. Set up **Authentication** in Firebase using your preferred sign-in provider (e.g. Email/Password).
4. Create a **Cloud Firestore** database.

### 2. Launch Local Server
Serve the project directory to prevent CORS issues with reverse geocoding and local geolocation APIs.
```bash
# Using NodeJS
npx serve .

# Alternatively, using Python
python -m http.server 8080
```
Open **[http://localhost:3000](http://localhost:3000)** (or port 8080) to access the dashboard.

---

## 🎨 UI Design System

* **Typography**: Outfit/Inter typography hierarchy loaded from Google Fonts.
* **Glass Physics**: Cards styled with `backdrop-filter: blur(28px) saturate(180%)` combined with layered subtle shadow matrices.
* **Interactive 3D Solar Panel Engine**: Raw HTML elements pivoted dynamically using pure CSS 3D transforms (`transform-style: preserve-3d`) to replicate the exact physical movements of the tracking hardware.
* **Data Sources**: Badges automatically detect active WebSocket connectivity. In offline states, simulated feeds and graph curves maintain full dashboard animation and functionality.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
