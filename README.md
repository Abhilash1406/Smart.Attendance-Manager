# Smart Attendance Management System
### T&P Department — College Training & Placement

---

## Overview

A full-stack attendance management system for college T&P sessions.

- Students log in with college Google accounts
- Capture a live webcam photo to submit attendance
- Admin reviews, approves, or rejects requests
- Attendance photos auto-deleted after 7 days
- Restricted to college WiFi only

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS            |
| Backend  | Spring Boot 3.2, Java 21, Maven         |
| Database | MongoDB                                 |
| Auth     | Google OAuth 2.0 + JWT                  |
| Storage  | Local filesystem (configurable)         |

---

## Project Structure

```
smart-attendance/
├── backend/      # Spring Boot application
└── frontend/     # React + Vite application
```

---

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+
- MongoDB 6+ (local or Atlas)
- Google Cloud Console project with OAuth 2.0 credentials

---

## Step 1 — Google OAuth Setup

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Navigate to **APIs & Services → Credentials**
4. Create **OAuth 2.0 Client ID** → Web Application
5. Add Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:8080`
6. Add Authorized redirect URIs:
   - `http://localhost:5173`
7. Copy the **Client ID** — you'll need it for both backend and frontend

---

## Step 2 — Backend Setup

### Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/smart_attendance
JWT_SECRET=your-minimum-32-char-secret-here-change-in-production
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
ALLOWED_EMAIL_DOMAIN=kitsw.ac.in
ATTENDANCE_WINDOW_START=09:00
ATTENDANCE_WINDOW_END=09:15
PHOTO_RETENTION_DAYS=7
UPLOAD_DIR=./uploads/attendance
ALLOWED_IPS=127.0.0.1,::1,192.168.1.,10.0.0.
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Generate JWT secret

```bash
openssl rand -base64 64
```

### Run the backend

```bash
cd backend

# Option A: Source env and run with Maven
export $(cat .env | xargs) && mvn spring-boot:run

# Option B: Set env in your IDE (IntelliJ run config)
# then: mvn spring-boot:run

# Option C: Build JAR and run
mvn clean package -DskipTests
java -jar target/attendance-1.0.0.jar
```

Backend starts at: http://localhost:8080

---

## Step 3 — Frontend Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=/api
```

Install dependencies and run:

```bash
npm install
npm run dev
```

Frontend starts at: http://localhost:5173

---

## Step 4 — Create Admin User

By default, all new users get the STUDENT role.
To make someone an admin, update their role directly in MongoDB:

```javascript
// In MongoDB shell or Compass
use smart_attendance

db.users.updateOne(
  { email: "admin@kitsw.ac.in" },
  { $set: { role: "ADMIN" } }
)
```

Or insert an admin directly (the user must log in first, then update):

1. Log in with the admin Google account (domain must match)
2. Run the update above in MongoDB
3. Log out and log back in — they'll be routed to the Admin Dashboard

---

## API Reference

### Authentication

```
POST /api/auth/google
Body: { "idToken": "<google_id_token>" }
Response: { "token": "jwt...", "user": {...} }

GET /api/auth/me
Headers: Authorization: Bearer <jwt>
```

### Student Endpoints

```
POST /api/attendance/mark
Headers: Authorization: Bearer <jwt>
Body: multipart/form-data { photo: <file> }

GET /api/attendance/history
Headers: Authorization: Bearer <jwt>

GET /api/attendance/status/today
Headers: Authorization: Bearer <jwt>
```

### Admin Endpoints

```
GET  /api/admin/pending
GET  /api/admin/requests
POST /api/admin/approve/{id}     Body: { "remarks": "..." }
POST /api/admin/reject/{id}      Body: { "remarks": "..." }
GET  /api/admin/stats/daily      ?date=2024-06-01
GET  /api/admin/reports          ?from=2024-06-01&to=2024-06-30
GET  /api/admin/students
```

---

## Key Configuration

### Attendance Window

Edit `application.yml` or set env vars:

```yaml
app:
  attendance:
    window-start: "09:00"
    window-end:   "09:15"
```

To allow marking all day during development:

```env
ATTENDANCE_WINDOW_START=00:00
ATTENDANCE_WINDOW_END=23:59
```

### Network Restriction

```env
# Comma-separated. Supports exact IP or prefix (e.g., 192.168.1.)
ALLOWED_IPS=127.0.0.1,::1,192.168.1.,10.0.0.
```

During local development, `127.0.0.1` and `::1` are always included.

### Photo Cleanup

```env
PHOTO_RETENTION_DAYS=7   # Photos deleted after N days, attendance record preserved
```

Cleanup runs automatically at 2:00 AM daily via Spring Scheduler.

---

## Production Deployment

### Backend

```bash
# Build production JAR
mvn clean package -DskipTests

# Run with production config
java -jar target/attendance-1.0.0.jar \
  --spring.profiles.active=prod \
  --MONGODB_URI=mongodb+srv://... \
  --JWT_SECRET=<secure-256bit-secret> \
  --GOOGLE_CLIENT_ID=<client-id> \
  --ALLOWED_EMAIL_DOMAIN=kitsw.ac.in \
  --CORS_ALLOWED_ORIGINS=https://yourfrontend.com
```

### Frontend

```bash
# Build for production
npm run build
# Output in dist/ — serve with Nginx or any static host
```

### Nginx example (serves frontend + proxies API)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        proxy_pass http://localhost:8080/uploads/;
    }
}
```

---

## Security Notes

- JWT secret must be at least 256 bits in production
- Never commit `.env` or `.env.local` files
- Set `ALLOWED_IPS` to actual college network ranges
- Set `ALLOWED_EMAIL_DOMAIN` to your college domain
- Use HTTPS in production (update CORS origins accordingly)
- MongoDB should require authentication in production

---

## Troubleshooting

**Google login says "domain not allowed"**
→ Your Google account email domain doesn't match `ALLOWED_EMAIL_DOMAIN`

**Camera not loading**
→ Browser requires HTTPS for webcam in production. Use localhost for dev.

**"Attendance can only be marked from college network"**
→ Your IP is not in `ALLOWED_IPS`. Add `127.0.0.1` for local testing.

**Photos not serving**
→ Check `UPLOAD_DIR` path exists and Spring has write permissions.

**MongoDB connection error**
→ Verify `MONGODB_URI` and that MongoDB is running on the correct port.
