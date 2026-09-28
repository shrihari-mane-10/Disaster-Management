# AI Coding Agent Context — Keyless Edition
## Disaster Response Coordination App

> Read this fully before writing or changing any code. It is the source of truth for stack, rules, and debugging hints.

---

### 1. What This Is

Real-time disaster coordination platform. Three roles: **citizen** (SOS/report), **volunteer** (tasks, live location), **authority/admin** (live map, dispatch, resources, alerts). Student/hackathon MVP, time-boxed.

### 2. Hard Rules

1. **No API keys, no paid services, no cloud signups** in the MVP. Do not add Google Maps, Mapbox, Firebase, Twilio, AWS, Redis, MongoDB.
2. Stay in **TypeScript/JavaScript**. Don't introduce new languages/frameworks without asking.
3. Don't change the stack, folder structure or data models unless provably broken. Explain first if you must.
4. Prefer **minimal targeted fixes** over rewrites.
5. Anything requiring a paid/keyed service must go behind an **adapter interface** with a mock implementation.
6. Never commit secrets; keep `.env.example` updated.

### 3. Stack

- Mobile: React Native + Expo + TypeScript; maps via WebView + Leaflet + OSM tiles
- Dashboard: React + Vite + TypeScript + Tailwind + react-leaflet
- Backend: Node + Express + TypeScript + Socket.IO + Prisma + PostgreSQL (Docker)
- Auth: JWT + bcrypt; validation: zod; uploads: multer (local `/uploads`)
- Live locations: in-memory Map (flush to DB ~30 s)
- Alerts: Socket.IO + local device notifications; SMS is **mocked**
- State: Redux Toolkit (mobile), React Query (dashboard)

### 4. Data Models (fields)

```
User      id,name,phone,email,passwordHash,role,lat,lng,available,lastSeenAt
Incident  id,reporterId,type,description,severity,status,lat,lng,verified
Media     id,incidentId,path
Task      id,incidentId,volunteerId,status,assignedAt,resolvedAt
Resource  id,type,quantity,lat,lng,status
Shelter   id,name,lat,lng,capacity,occupancy
Alert     id,message,region,severity,channel,createdBy,createdAt
```
Enums — role: citizen|volunteer|authority|admin · severity: low|medium|high|critical · incident status: pending|assigned|in_progress|resolved|rejected · task status: assigned|enroute|reached|resolved

### 5. API & Events

Base `/api/v1`: `/auth/{register,login,me}`, `/incidents` (+`/:id`, `/:id/nearby-volunteers`, `/:id/assign`), `/tasks/mine`, `/tasks/:id`, `/resources`, `/shelters`, `/alerts/send`, `/alerts`, `/users/me/location`.
Socket namespace `/live`: `location:update`, `incident:new`, `incident:statusChange`, `task:assigned`, `task:statusChange`, `alert:broadcast`. Rooms: `authority`, `volunteer:<id>`, `citizen:<id>`.

### 6. Business Rules

- Nearest volunteers = Haversine, `available=true`, seen within 5 min, top N; authority confirms assignment (not automatic).
- Location pings every 5–10 s over socket; never write DB per ping.
- All mobile writes go through the **offline queue**; never drop a report on network failure.
- Navigation = open `geo:` link in phone's maps app (no routing API).
- Notification code goes through `NotificationProvider` (`SocketProvider`, `MockSmsProvider`).

### 7. Common Errors & Fixes (check these first)

| Symptom | Likely cause / fix |
|---|---|
| Phone can't reach API ("Network request failed") | Using `localhost`; use laptop LAN IP, same Wi-Fi, backend bound to `0.0.0.0`, firewall allows port 4000. Android emulator uses `10.0.2.2` |
| CORS error on dashboard | Add dashboard origin (e.g. `http://localhost:5173`) to backend CORS config |
| Socket connects then drops / 401 | JWT not passed in `auth` handshake or expired |
| Map tiles blank in WebView | Missing internet on device, or Leaflet CSS/JS not loaded; check `originWhitelist` and that tile URL is `https://tile.openstreetmap.org/{z}/{x}/{y}.png` |
| Leaflet markers missing icons | Set default icon URLs explicitly (bundler path issue) |
| Prisma error on enums/arrays with SQLite | SQLite lacks them; use Postgres or strings/JSON |
| Image upload fails | Request must be `multipart/form-data`; don't set Content-Type manually in RN fetch; check multer limits |
| Location permission denied | Request foreground permission via `expo-location` before use; handle denial with manual fallback |
| Docker Postgres connection refused | Container not up, wrong `DATABASE_URL` host/port; run `docker compose up -d` |
| iOS build fails on Windows/Linux | iOS needs macOS/Xcode; test Android or Expo Go instead and say so |

### 8. Definition of Done (MVP)

- [ ] Register/login works for all roles
- [ ] SOS from phone appears on dashboard map live
- [ ] Incident report with photo + location saved
- [ ] Authority assigns nearest volunteer; volunteer receives task instantly
- [ ] Task status updates reflect on dashboard live
- [ ] Alert broadcast reaches app in-app + appears in mock SMS log
- [ ] Offline report syncs after reconnect
- [ ] Seed data + demo script ready

### 9. How To Work

1. Read this file, then the specific task.
2. Inspect existing code before changing it; don't assume.
3. Make the smallest change that works; run/verify it.
4. When finishing, report: what changed, files touched, how to test, what's left.
5. If blocked or unsure, ask one specific question instead of guessing.
6. If a limit is about to hit, stop at a clean point and output a **handoff summary** (see Master Prompt File, Section C).
