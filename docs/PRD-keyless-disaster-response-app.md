# Product Requirements Document (PRD) — Keyless Edition
## Disaster Response Coordination App

> **Keyless rule:** the MVP must run with **zero API keys, zero paid accounts, and zero cloud signups**. Everything runs locally or on free hosting. Paid/keyed services are listed only as a future upgrade path.

---

### 1. Overview

**Purpose:** A real-time platform that connects citizens, volunteers and authorities during disasters (floods, earthquakes, cyclones) so help reaches the right place quickly.

**Problem:** Help often exists but is poorly coordinated. Volunteers don't know where to go, authorities lack a live picture, victims can't reach anyone.

**Users:**
1. **Citizen** – reports incidents, sends SOS
2. **Volunteer** – receives tasks, updates status
3. **Authority / Admin** – monitors live map, dispatches, manages resources

---

### 2. Platforms

- **Mobile app** (Citizen + Volunteer): React Native, Android + iOS
- **Web dashboard** (Authority/Admin): React, runs in any desktop browser (covers the "desktop" need)

---

### 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Faster response | Time from SOS to volunteer assignment |
| Fewer duplicate responses | % incidents handled by exactly one team |
| Live visibility | Dashboard reflects new incidents within ~3 s |
| Works in bad networks | Reports made offline are synced, none lost |

---

### 4. Roles & Permissions

| Role | Can do |
|---|---|
| Citizen | Send SOS, report incident, view own reports, see alerts, view shelters |
| Volunteer | See assigned tasks, update task status, open navigation, share location |
| Authority | Live map, view/verify incidents, assign volunteers, manage resources/shelters, broadcast alerts |
| Admin | Everything above + manage users |

---

### 5. MVP Features (build these)

1. **Auth** – register/login with JWT, role-based access
2. **SOS button** – one tap, sends critical incident + current GPS location
3. **Incident report** – description, type, severity, photo, auto-location
4. **Live map dashboard** – incidents, colour-coded by severity, updates in real time
5. **Assign volunteer** – authority sees nearby available volunteers (distance-sorted) and assigns one
6. **Volunteer tasks** – accept, en route, reached, resolved; live location sharing
7. **In-app alerts** – authority broadcasts alert; users get it instantly (Socket.IO) plus a local notification on the device
8. **Simulated SMS** – alert service logs "SMS sent to X" and shows it in a *Sent Log* screen (no real SMS)
9. **Resources & shelters** – simple CRUD with capacity/occupancy
10. **Offline queue** – reports and status updates stored locally and synced on reconnect

---

### 6. Keyless Replacements (decisions already made)

| Need | Keyless choice |
|---|---|
| Maps | OpenStreetMap tiles + Leaflet |
| Navigation | Open the phone's maps app via `geo:` link (no routing API) |
| Push / alerts | Socket.IO in-app + local device notifications |
| SMS | Mock provider that logs and stores messages |
| Database | Local PostgreSQL (Docker) |
| Live-location cache | In-memory store in the backend |
| Photo storage | Local `/uploads` folder (multer) |
| Auth | Own JWT + bcrypt |
| Distance / "nearest" | Haversine formula in code |

---

### 7. Future Scope (mention in pitch, do not build)

Real SMS (Twilio), push when app is closed (FCM), routing around blocked roads, geo-fencing, missing-person matching, drone/satellite damage detection, blood-donor matching, weather/IMD integration, voice reporting, multilingual UI, WhatsApp chatbot, donation transparency tracker.

---

### 8. User Flows

- **Citizen:** open app → SOS or Report → location auto-attached → sent → sees status updates
- **Volunteer:** login → tasks list → accept → navigate → reached → resolved
- **Authority:** login → live map → open incident → verify → assign volunteer → track → broadcast alert if needed

---

### 9. Non-Functional Requirements

- Works on a local network for demos (phone + laptop on the same Wi-Fi)
- Real-time updates under ~3 s on LAN
- No secrets committed; `.env` only for local values (DB URL, JWT secret)
- Respect OpenStreetMap tile usage policy (demo scale only, show attribution)

---

### 10. Out of Scope

Real SMS/push, paid map APIs, native desktop app, payments/donations, third-party government data.

---

### 11. Assumptions & Risks

- Student/hackathon timeline, team knows React/JavaScript
- iOS testing needs a Mac; Android can be tested on any machine
- Phone must reach the backend over LAN IP (not `localhost`)
- Free public OSM tiles are for demos only
