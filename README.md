# ☀️ RAYMAX — Solar Tracking System

> **Real-time solar panel tracking with GPS, live weather, robust authentication, ESP32 WebSocket integration, and 3D visualization running in a seamless glassmorphism React application.**

![RAYMAX Banner](https://img.shields.io/badge/RAYMAX-Solar%20Tracking%20System-orange?style=for-the-badge&logo=sun&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Auth/Firestore-FFCA28?style=flat-square&logo=firebase)
![ESP32](https://img.shields.io/badge/Hardware-ESP32%20WebSocket-222?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📖 Overview

**RAYMAX** is a browser-based, full-stack solar panel tracking and monitoring platform. It calculates real-time sun position using astronomical algorithms (NOAA model), fetches live weather data, connects to ESP32 hardware via WebSockets for live data and servo control, and secures user data using a robust dual-method Firebase authentication system. 

It is designed with a premium, responsive glassmorphism UI, operating entirely via CDN-loaded React and Babel without requiring a local Node.js build step.

---

## ✨ Key Features & Recent Updates

| Feature | Description |
|---|---|
| 🔐 **Dual Authentication** | Secure Login/Signup portal supporting both **Firebase Email/Password Auth** and **Custom Mobile/Password Auth** (stored securely in distinct Firestore collections). |
| 🛡️ **Intelligent Auth Guard** | Real-time session validation against Firestore ensures zero unauthenticated access to the live dashboard. |
| 👤 **Profile Portal** | Glassmorphism modal interface allowing users to link Email and Mobile accounts dynamically and securely update passwords. |
| 🔌 **ESP32 WebSocket Sync** | Bi-directional real-time communication. Send Auto/Manual tracking commands to specific IPs and receive live LDR, voltage, and temperature telemetry. |
| 📈 **Historical Data Charts** | Live-updating `Chart.js` graphs displaying Power Output, Voltage, and Temperature over a 60-read history buffer. |
| 📡 **Live Serial Monitor** | Real-time payload inspector for debugging active data frames originating from the ESP32 hardware. |
| 🌍 **GPS & Weather** | Live geolocation (OpenStreetMap) combined with real-time solar weather (Open-Meteo) metrics (UV, Cloud Cover). |
| 🌅 **Sun Tracking & SVG Map** | Real-time Sun Elevation & Azimuth algorithms rendered on a dynamic SVG sky map compass. |
| 🔆 **Interactive 3D Panel** | CSS 3D solar panel that physically mirrors live orientation commands. |
| 🔔 **Alert System Core** | Collapsible, dismissible top-bar Alert Ribbon and global Toast Notifications for deep physical system observability. |
| 🌙 **Dynamic Theming** | Persistent (localStorage) Light/Dark mode toggles that re-render the entire glass physics engine. |

---

## 🗂 Project Structure

```
RAYMAX/
│
├── index.html           # Main App shell (React 18, Babel CDN, Firebase SDK)
├── App.jsx              # Core React UI (Dashboards, Charts, Hardware Sync, Modals)
├── script.js            # Pure logic utilities (Sun algorithms, Data parsing)
├── style.css            # Live Dashboard Design System (Glassmorphism, Animations)
├── logo.png             # Official Project Branding
│
├── auth/                # Dedicated Authentication Gateway
│   ├── index.html       # Auth Portal Shell
│   ├── auth.jsx         # Login/Signup routing, Dual-Auth logic
│   └── auth.css         # Minimalist fluid gradients & layout for Auth Views
│
└── README.md            # You are here
```

---

## 🚀 Getting Started

### Zero Build Step Execution

Simply launch a local web server to serve the static files.

```bash
# Recommended: Local dev server (Prevents CORS / Geolocation issues)
npx serve .

# Alternatively with Python
python -m http.server 8080
```

> ⚠️ **Requirements:**
> 1. **Firebase**: Ensure your `firebaseConfig` object inside `index.html` and `auth/index.html` is populated with active credentials.
> 2. **Hardware**: To view live Arduino data, ensure your ESP32 is running the Raymax WebSocket Server firmware and is on the same local network.

---

## 🛠 Tech Stack & Integrations

- **Frontend Core**: React 18, Babel Standalone
- **Design Core**: Pure CSS Variables, Glassmorphism, CSS 3D Transforms
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **Hardware Comms**: Native JavaScript WebSockets (`ws://`)
- **Visualizations**: Chart.js (CDN)
- **External APIs**: Open-Meteo (Weather), Nominatim (Reverse Geocoding)

---

## ⚙️ Solar & Hardware Algorithms

### Sun Position (`calcSunPos`)
Uses the **NOAA simplified solar position model** to calculate dynamic Elevation and Azimuth mapping based on device GPS boundaries.

### Arduino Sensor Mirroring Formula
When hardware is disconnected, RAYMAX mathematically simulates expected voltage output:
```
P (Watts) = 400W × cos(incidence angle) × (1 − cloudCover / 200)
Voltage = simulated_sensor × (5.0 / 1023.0) × 3
```

When connected to ESP32:
The dashboard overrides mathematical estimations by injecting raw `JSON` telemetry directly into the React state and Chart buffers.

---

## 🎨 Design System

- **Extreme Glassmorphism**: Relies heavily on `backdrop-filter: blur(28px) saturate(180%)` layered over fluid CSS organic blob animations.
- **Premium Typographics**: `Inter` system stack.
- **Micro-interactions**: Smooth scale-ups, color-fading gradients mapping user login methods, and reactive hover physics.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Made with ☀️ by <strong>raisahibb</strong>
</div>
