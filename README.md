# 🚨 ResQ - Keyless Disaster Response Coordination Platform

A real-time, zero-paid-key disaster coordination platform where **Citizens** send instant SOS & incident reports, **Volunteers** receive nearest rescue dispatches with turn-by-turn navigation, and **Authorities** command operations with live Leaflet maps, multi-channel alerts, and resource management.

---

## 🔒 100% Keyless Architecture Guarantee
This platform operates completely **without paid APIs, cloud keys, or vendor lock-in**:
- 🗺️ **Maps**: OpenStreetMap tiles embedded via `react-leaflet` (Dashboard) and `react-native-webview` + Leaflet (Mobile).
- 🧭 **Routing & Navigation**: Native device maps invoked via standard `geo:` and `maps:` URI intents.
- 📐 **Proximity Calculation**: Pure mathematical Haversine spherical distance calculation.
- 📱 **Notifications**: Real-time WebSockets over Socket.IO `/live` namespace + Simulated Cellular SMS provider (`MockSmsProvider`).
- 📂 **Storage**: Local filesystem uploads served statically via Express `/uploads`.
- 📴 **Offline Support**: Mobile write queue persisted via `AsyncStorage` with auto-replay on reconnect.

---

## 🏗️ Architecture & Monorepo Structure

```
├── backend/          # Node.js + Express + TypeScript + Prisma + PostgreSQL + Socket.IO
│   ├── prisma/       # schema.prisma (7 models) & seed.ts
│   ├── src/
│   │   ├── controllers/  # auth, incident, task, user, resource, shelter, alert
│   │   ├── middleware/   # JWT auth, Zod validation, Multer upload, Rate limiting
│   │   ├── services/     # NotificationProvider (SocketProvider, MockSmsProvider)
│   │   ├── sockets/      # Socket.IO /live gateway & in-memory locationStore (30s DB flush)
│   │   └── server.ts     # Express + HTTP + Socket.IO server on 0.0.0.0:4000
│
├── dashboard/        # React 19 + Vite + TypeScript + Tailwind CSS v4 + react-leaflet
│   ├── src/
│   │   ├── components/   # ProtectedRoute, Layout, StatusBadge, AssignVolunteerModal
│   │   ├── context/      # AuthContext, SocketContext
│   │   ├── pages/        # LoginPage, LiveMapPage, IncidentsPage, AlertsPage, ResourcesPage, SheltersPage
│   │   └── lib/api.ts    # Axios client with JWT interceptors
│
├── mobile/           # React Native + Expo (SDK 57) + Redux Toolkit + TypeScript
│   ├── src/
│   │   ├── components/   # MapView (Leaflet WebView), StatusBadge, OfflineBanner
│   │   ├── navigation/   # Role-based: CitizenNavigator & VolunteerNavigator
│   │   ├── screens/      # HomeScreen (SOS), ReportScreen, MyReports, Alerts, Shelters, VolunteerTasks, TaskDetail
│   │   ├── services/     # Socket.IO client, OfflineQueue, LocationPosting, Notifications
│   │   └── store/        # Redux Toolkit (auth, incidents, tasks, alerts)
│
└── docker-compose.yml # Local PostgreSQL container configuration
```

---

## 🚀 Quick Start Setup

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **PostgreSQL**: Local PostgreSQL service OR Docker Desktop
- **Expo Go App** (optional): On physical iOS/Android phone, or run in web mode

---

### Step 1: Database Setup

#### Option A: Using Docker (Recommended)
```bash
docker compose up -d
```

#### Option B: Using Local PostgreSQL
Ensure PostgreSQL is running locally on port `5432` with a database named `disaster_db`.

In `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/disaster_db?schema=public"
JWT_SECRET="disaster_secret_key_change_in_production_xyz123"
PORT=4000
```

Apply database migrations and populate demo data:
```bash
cd backend
npm install
npx prisma db push
npx tsx prisma/seed.ts
```

---

### Step 2: Start the Backend Server

```bash
cd backend
npm run dev
```
* Backend runs on **`http://localhost:4000/api/v1`**
* Health check: `http://localhost:4000/api/v1/health`
* Socket.IO Live Gateway: `ws://localhost:4000/live`

---

### Step 3: Start the Web Dashboard

```bash
cd dashboard
npm install
npm run dev
```
* Open **`http://localhost:5173`** in your web browser.

---

### Step 4: Start the Mobile App

Find your computer's local LAN IP address (e.g. `192.168.1.100` via `ipconfig` or `ifconfig`):

```bash
cd mobile
npm install

# On Windows PowerShell:
$env:EXPO_PUBLIC_API_URL="http://<YOUR_LAN_IP>:4000"
npm start

# On Mac/Linux:
EXPO_PUBLIC_API_URL="http://<YOUR_LAN_IP>:4000" npm start
```

* **To test in Web Browser**: Press `w` in the Expo terminal.
* **To test on Physical Phone**: Scan the QR code using the **Expo Go** app.

---

## 👥 Demo User Credentials

All demo accounts are pre-seeded with password **`password123`**:

| Role | Email | Name | Key Capabilities |
|---|---|---|---|
| **Authority** | `authority@example.com` | Officer Davis | Live Map, Incident Verification, Haversine Dispatch, Alerts, Shelters |
| **Admin** | `admin@example.com` | System Admin | Full system administration and oversight |
| **Volunteer** | `volunteer@example.com` | Jane Volunteer | Task Inbox, Turn-by-Turn Navigation, Status Updates, On/Off Duty GPS |
| **Volunteer 2** | `volunteer2@example.com` | David Responder | Secondary Field Medic |
| **Citizen** | `citizen@example.com` | John Citizen | 1-Tap SOS, Photo Incident Reporting, Alerts Feed, Shelters Navigation |

---

## ⏱️ 5-Minute Live End-to-End Demo Script

Follow this script to demonstrate the full disaster response lifecycle:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             DEMO FLOW OVERVIEW                           │
│                                                                          │
│  Citizen App           Authority Dashboard            Volunteer App      │
│  ───────────           ───────────────────            ─────────────      │
│  1. Tap SOS ─────────► Appears on Live Map                               │
│                         2. Verify & Dispatch ────────► 3. Push Alert Ring │
│                                                        4. Navigate to GPS │
│  6. Status Updates ◄── 5. Status Updates ◄──────────── 5. Mark En Route  │
│  7. Alert Push ◄────── 8. Broadcast Alert                                │
└──────────────────────────────────────────────────────────────────────────┘
```

### Act 1: Citizen SOS Broadcast (Phone)
1. Open the mobile app and log in as `citizen@example.com`.
2. Tap the large pulsating **EMERGENCY SOS** button.
3. Observe: GPS coordinates are captured automatically and the emergency report is submitted instantly.

### Act 2: Authority Command & Live Map (Web Dashboard)
1. Open the Web Dashboard at `http://localhost:5173` and log in as `authority@example.com`.
2. Observe: Without refreshing the page, a red pulsating pin appears on the Leaflet map and a floating `"🚨 EMERGENCY SOS BROADCAST"` banner triggers.
3. Click the incident pin to inspect details, reporter information, and attached scene photos.
4. Click **"Verify Incident"** to validate the report.

### Act 3: Haversine Nearest Volunteer Dispatch (Web Dashboard)
1. In the incident popup or table, click **"Dispatch Volunteer"**.
2. Observe: The system runs the Haversine distance algorithm against all active volunteers and ranks them (e.g. *Jane Volunteer — 0.35 km away [NEAREST]*).
3. Click **"Dispatch Selected Volunteer"**. The incident status flips to `assigned` in real time.

### Act 4: Volunteer Turn-by-Turn Rescue (Phone)
1. In a second mobile instance/browser, log in as `volunteer@example.com`.
2. Observe: A high-priority push notification triggers (`"🚨 NEW RESCUE ASSIGNMENT"`), and the task appears in **My Tasks**.
3. Open the task:
   - Mini-map shows incident location.
   - Tap **"Open Turn-by-Turn Navigation"** to launch native device navigation.
   - Tap **"Mark En Route"** $\to$ **"Arrived On Site"** $\to$ **"Mark Resolved"**.
4. Observe: Statuses update dynamically across the Citizen's screen and Authority dashboard without page refreshes.

### Act 5: Multi-Channel Emergency Broadcast (Web Dashboard)
1. On the dashboard, navigate to **"Broadcast Alerts"** (`/alerts`).
2. Type an alert: *"FLASH FLOOD WARNING: Evacuate riverbank lowlands immediately."*
3. Select **Critical** and click **"Broadcast Emergency Alert Now"**.
4. Observe:
   - The phone rings with an immediate push notification and displays the alert in the **Alerts** tab.
   - The backend console logs simulated carrier cellular transmissions (`[MOCK SMS GATEWAY] >>> Recipient: +919876543210`).
   - The dashboard **Sent Log** records both WebSocket and Mock SMS delivery rows.

### Act 6: Offline Resilience Test (Phone)
1. Turn on Airplane Mode or disconnect your network on the mobile app.
2. Submit an incident or status update — the app confirms locally and enqueues the request.
3. Re-enable network — observe the offline queue automatically replays requests with 0 data loss.

---

## 📡 API & WebSocket Event Reference

### REST Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new citizen/volunteer |
| `POST` | `/api/v1/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/v1/auth/me` | JWT | Get profile of logged-in user |
| `POST` | `/api/v1/incidents` | Optional | Create incident with optional multipart media |
| `GET` | `/api/v1/incidents` | Public | List incidents with status/severity filters |
| `GET` | `/api/v1/incidents/:id/nearby-volunteers` | Authority | Get volunteers sorted by Haversine distance |
| `POST` | `/api/v1/incidents/:id/assign` | Authority | Assign volunteer and create Task |
| `GET` | `/api/v1/tasks/mine` | Volunteer | List volunteer's assigned tasks |
| `PATCH` | `/api/v1/tasks/:id` | Volunteer/Auth | Transition task status |
| `POST` | `/api/v1/users/me/location` | User | Update GPS ping |
| `POST` | `/api/v1/alerts/send` | Authority | Multi-channel broadcast |
| `GET` | `/api/v1/alerts` | JWT | Get alert history |
| `GET` | `/api/v1/shelters` | Public | List evacuation shelters & occupancy |
| `GET` | `/api/v1/resources` | Public | List emergency inventory |

### WebSocket (`/live` Namespace) Events
| Event | Direction | Description |
|---|---|---|
| `location:update` | Client $\to$ Server $\to$ Authority | Real-time GPS coordinates of active volunteer |
| `incident:new` | Server $\to$ Authority | Real-time notification of new SOS/incident |
| `incident:statusChange` | Server $\to$ Authority & Citizen | Real-time update on incident status |
| `task:assigned` | Server $\to$ Volunteer & Authority | Instant dispatch notification to assigned volunteer |
| `task:statusChange` | Server $\to$ Authority & Citizen | Real-time task progression |
| `alert:broadcast` | Server $\to$ All Clients | High-priority emergency warning broadcast |
| `volunteers:snapshot` | Server $\to$ Authority | Initial live map positions of all active volunteers |

---

## 🛡️ License
Built with open-source tools for rapid, life-saving disaster coordination.
