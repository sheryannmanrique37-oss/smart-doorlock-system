# Smart Door Lock System - Documentation

## 1. Description
This project represents a complete End-to-End Github-Pages-Ready Smart Door Lock solution using an ESP8266 microcontroller natively interacting with Google Firebase REST layers. 

Administrators are securely authenticated locally on modern serverless SDK standards, and access payloads execute straight globally yielding maximum uptime without backend VPS architectures. 

## 2. Tech Stack Setup (100% Serverless Github Workflow)
- **Frontend App:** Fully Static SPA designed to be hosted directly on **GitHub Pages**.
- **Web UI & Security:** Firebase Web Authentication (`10.9.0 SDK`).
- **Database Tracking:** Firebase Realtime Database.
- **Hardware Controller:** ESP8266 NodeMCU Firmware powered with native Network Time Sync (`NTP`) resolving time metrics!

## 3. Advanced Features Highlight
1. **Interactive OLED Module:** Instant real-time hardware status reflection via `Adafruit_SSD1306` interface. The user visualizes processes locally before interacting with the database.
2. **Locking & Unlocking Tracker:** Scanning your authentication tag *Toggles* the lock state (If Unlocked -> Triggers Lock; If Locked -> Triggers Unlock). Firebase securely maps these metrics across `UNLOCK`, `LOCK`, or `DENIED` datasets.
3. **Admin Registration Checkpoints:** Hosted natively, Firebase Authentication enforces tight protection schemes directly bridging HTML domains seamlessly. 
4. **Time Scheduling & NTP Integration:** Since PHP was completely deleted to support free Github Pages hosting, the ESP module automatically syncs `UTF+8 Manila Time` globally relying on `pool.ntp.org` to block visitors checking-in blindly.

## 4. Setup / Hosting Guide

### Step 1: Firebase Configuration Matrix
1. Go to Firebase Console and Create a New Project.
2. Enable **Realtime Database**. Adjust Security Rules allowing `public reads/writes` locally while testing, then shift to Secret REST patterns natively.
3. Enable **Authentication** tools. (Email/Password configurations).
4. Extract your App config payload inside the **Project Settings -> General** layer.
5. Apply them directly into `js/firebase-init.js`!

### Step 2: GitHub Pages (Free Web Hosting)
1. Initialize a new GitHub repository physically mapped to this folder.
2. Ensure you delete or don't commit legacy structures (like `php/` endpoints since everything is natively migrated to `js/script.js` serverside flows!).
3. Visit the repo **Settings** > **Pages** > **Deploy from Branch (main/root)**.
4. Your application is physically published on the `github.io` standard!

### Step 3: ESP8266 Arduino IDE Flashing
1. Ensure the board selected targets the generic NodeMCU architecture.
2. You **MUST** install the `ArduinoJson` library (V6+ usually preferred) via the Arduino Library Manager!
3. Inside `esp8266/esp8266.ino`, replace `#define FIREBASE_HOST` pointing securely against your base Realtime DB link and map the Legacy Database Secret mapped explicitly within `#define FIREBASE_SECRET` configuration.

## 5. Wiring Diagram Guide
- **0.96 OLED Display:**
  - SDA -> D2 (GPIO4) `Hardware wire I2C map default`
  - SCL -> D1 (GPIO5) `Hardware wire I2C map default`

- **Fingerprint Scanner:**
  - TX of Sensor -> D3 (GPIO0) `Using SoftwareSerial mapped RX`
  - RX of Sensor -> D0 (GPIO16) `Using SoftwareSerial mapped TX`

- **MFRC522 RFID Scanner:**
  - SDA/SS -> D4 (GPIO2)
  - SCK -> D5 (GPIO14)
  - MISO -> D6 (GPIO12)
  - MOSI -> D7 (GPIO13)
  - RST -> 3.3V power

- **Relay System Module:**
  - Signal OUT -> D8 (GPIO15)

## 6. How it operates globally?
The Arduino actively deserializes flat metric databases bypassing proxy servers directly checking logic parameters natively relying heavily on `time()` Unix blocks and rendering physical actions tracking explicit log commands securely against the cloud platform!
