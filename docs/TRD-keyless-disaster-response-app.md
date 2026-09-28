# Technical Requirements Document (TRD) — Keyless Edition
## Disaster Response Coordination App

---

### 1. Architecture

```
[React Native app]  --REST + Socket.IO--\
 (Citizen, Volunteer)                     >  [Node/Express API] -- [PostgreSQL (Docker)]
[React web dashboard] --REST + Socket.IO-/         |
 (Authority, Admin)                                 |-- in-memory live-location store
                                                    |-- /uploads (local files)
                                                    |-- NotificationProvider (mock SMS + socket alerts)
```

---

### 2. Tech Stack (all free, no keys)

| Layer | Choice |
|---|---|
| Mobile | React Native with **Expo** (TypeScript) |
| Mobile maps | `react-native-webview` embedding **Leaflet + OSM tiles** (works in Expo Go, no native map SDK, no key). Alternative: MapLibre RN (needs dev build) |
| Web dashboard | React + **Vite** + TypeScript + Tailwind + `react-leaflet` |
| Backend | Node.js + Express + TypeScript |
| Real-time | Socket.IO |
| ORM / DB | Prisma + **PostgreSQL via Docker Compose** (fallback: SQLite, but use strings/JSON instead of enums/arrays) |
| Live locations | In-memory `Map` in backend (no Redis) |
| Uploads | `multer` to local `/uploads`, served statically |
| Auth | JWT + `bcrypt` |
| Validation | `zod` |
| State | Redux Toolkit (mobile), React Query (dashboard) |
| Offline | `@react-native-async-storage/async-storage` + queue |
| Local alerts | `expo-notifications` (local only) |
| Location | `expo-location` |
| Image pick | `expo-image-picker` |

MongoDB and Redis are **intentionally dropped** for the MVP.

---

### 3. Database Schema (Prisma sketch)

```
User      id, name, phone, email(unique), passwordHash, role(citizen|volunteer|authority|admin),
          lat?, lng?, available(bool), lastSeenAt, createdAt
Incident  id, reporterId, type, description, severity(low|medium|high|critical),
          status(pending|assigned|in_progress|resolved|rejected), lat, lng,
          verified(bool), createdAt, updatedAt
Media     id, incidentId, path
Task      id, incidentId, volunteerId, status(assigned|enroute|reached|resolved),
          assignedAt, resolvedAt?
Resource  id, type, quantity, lat?, lng?, status
Shelter   id, name, lat, lng, capacity, occupancy
Alert     id, message, region?, severity, channel(inapp|sms_mock), createdBy, createdAt
```

---

### 4. REST API (`/api/v1`)

```
POST /auth/register            POST /auth/login           GET /auth/me
POST /incidents (multipart)    GET  /incidents?status=&severity=
GET  /incidents/:id            PATCH /incidents/:id       (verify / status)
GET  /incidents/:id/nearby-volunteers      -> sorted by Haversine distance
POST /incidents/:id/assign     body { volunteerId }       -> creates Task
GET  /tasks/mine               PATCH /tasks/:id           body { status }
GET/POST/PATCH /resources      GET/POST/PATCH /shelters
POST /alerts/send              body { message, region?, severity }
GET  /alerts                   (includes mock-SMS sent log)
POST /users/me/location        body { lat, lng }
```

Static: `GET /uploads/<file>`.

---

### 5. Socket.IO (`/live`, JWT in handshake auth)

| Event | Direction | Purpose |
|---|---|---|
| `location:update` | client → server | volunteer/citizen position ping (every 5–10 s) |
| `incident:new` | server → authority room | new SOS/report |
| `incident:statusChange` | server → rooms | status/verification changed |
| `task:assigned` | server → that volunteer | new task |
| `task:statusChange` | server → authority | volunteer progress |
| `alert:broadcast` | server → all/regional | authority alert |

Rooms: `authority`, `volunteer:<id>`, `citizen:<id>`.

---

### 6. Key Logic

- **Nearest volunteers:** Haversine over volunteers where `available = true` and `lastSeenAt` within 5 min; return top N.
- **Live locations:** keep in in-memory map; flush to `User.lat/lng` every ~30 s.
- **NotificationProvider interface:** `send(userIds, message)`; implementations: `SocketProvider` (real), `MockSmsProvider` (logs + stores). Designed so `TwilioProvider` / `FcmProvider` can be dropped in later.
- **Offline queue (mobile):** every outgoing write goes through a queue; on failure it is persisted and retried on reconnect/app foreground. Uploads retried last.
- **Navigation:** volunteer taps "Navigate" → `Linking.openURL("geo:lat,lng?q=lat,lng")` (Android) / `maps:?ll=lat,lng` (iOS).

---

### 7. Networking for Local Demos

- Backend listens on `0.0.0.0:4000`.
- Mobile/dashboard use `EXPO_PUBLIC_API_URL=http://<laptop-LAN-IP>:4000` (never `localhost` on a phone).
- CORS enabled for the dashboard origin. Phone and laptop on the same Wi-Fi.
- Android emulator: `http://10.0.2.2:4000`.
- Free hosting for a shared demo: Render/Railway/Fly (backend + Postgres); still no API keys required by the app.

---

### 8. Security

JWT with role guard middleware, bcrypt hashing, zod validation, upload size/type limits, rate-limit on `/auth` and `POST /incidents`, no secrets in git, `.env.example` provided.

---

### 9. Folder Structure

```
/backend      src/{routes,controllers,services,sockets,middleware,lib}  prisma/  uploads/
/mobile       app/ or src/{screens,components,navigation,services,store,offline}
/dashboard    src/{pages,components,services,store}
docker-compose.yml   README.md   .env.example
```

---

### 10. Future Upgrade Path (swap-in, no rewrite)

| Now (keyless) | Later |
|---|---|
| Leaflet + OSM | Mapbox / Google Maps |
| Local notifications + sockets | Firebase Cloud Messaging |
| Mock SMS | Twilio / WhatsApp Business |
| Local uploads | S3 / Firebase Storage |
| In-memory locations | Redis |
| Haversine + `geo:` link | OSRM / Mapbox Directions |

---

### 11. Build Order

1. Backend + DB + auth → 2. Citizen app → 3. Volunteer app → 4. Dashboard → 5. Socket.IO real-time → 6. Alerts (socket + mock SMS) → 7. Polish + seed data + demo script
