# Smart Attendance Management System

A full-stack attendance management platform for college Training & Placement sessions with secure Google authentication, webcam-based attendance capture, admin approval workflows, and network-restricted access.

## Features

### Student Features

* Google OAuth login using college or personal Google email
* Live webcam photo capture for attendance
* Attendance history tracking
* Daily attendance status checking
* JWT-based secure authentication

### Admin Features

* Approve/reject attendance requests
* View pending requests dashboard
* Daily attendance analytics
* Student management
* Attendance reports export support

### Security Features

* Restricted to authorised email domains (`@kitsw.ac.in` and `@gmail.com`)
* Additional domains can be added via config without code changes
* Restricted to college WiFi/IP ranges
* JWT authentication with a cryptographically secure secret
* Automatic attendance photo cleanup
* Role-based access control (STUDENT / ADMIN)

---

## Tech Stack

| Layer          | Technology                   |
| -------------- | ---------------------------- |
| Frontend       | React 18, Vite, Tailwind CSS |
| Backend        | Spring Boot 3.2, Java 17     |
| Database       | MongoDB                      |
| Authentication | Google OAuth 2.0 + JWT       |
| Build Tools    | Maven, npm                   |
| Deployment     | Nginx + Spring Boot          |

---

## Architecture

```text
Frontend (React + Vite)
        ↓  Google ID Token
REST API (Spring Boot)
        ↓  Verify token → upsert user → issue JWT
MongoDB Database
        ↓
Local File Storage (Attendance Photos)
```

---

## Project Structure

```text
smart-attendance/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/tp/attendance/
│   │       └── resources/application.yml
│   ├── uploads/
│   ├── .env
│   └── pom.xml
│
└── frontend/
    ├── src/
    ├── public/
    ├── .env
    └── package.json
```

---

## Key Functionalities

### Authentication Flow

```text
React Login Button
→ Google Popup
→ Google ID Token
→ POST /api/auth/google
→ Server-side Google token verification
→ Email domain check (kitsw.ac.in or gmail.com)
→ MongoDB user lookup / creation
→ JWT generation
→ Response to frontend
→ Store JWT in localStorage
→ Redirect to Dashboard
```

### Attendance Flow

1. Student logs in using Google OAuth
2. Webcam photo captured
3. Attendance request submitted
4. Admin reviews request
5. Attendance approved/rejected
6. Photos auto-delete after configured retention period

### Network Restriction

Only users connected to the college network can mark attendance.

### Automatic Cleanup

Attendance photos are automatically removed after 7 days while preserving attendance records.

---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/Abhilash1406/Smart.Attendance-Manager.git
cd Smart.Attendance-Manager
```

---

## Backend Setup

### Configure `application.yml`

All runtime values are configured in `backend/src/main/resources/application.yml` with sensible defaults. Override any value by setting the corresponding environment variable listed in `backend/.env`.

Key configuration values:

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:<your-base64-secret>}      # Min 256-bit Base64 string
    expiration: ${JWT_EXPIRATION_MS:86400000}        # 24 hours

  google:
    client-id: ${GOOGLE_CLIENT_ID:<your-client-id>} # From Google Cloud Console

  allowed-domains: ${ALLOWED_EMAIL_DOMAINS:kitsw.ac.in,gmail.com}
  # Comma-separated list — add any domain without changing code

  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173}
```

> **Important:** Spring Boot does **not** auto-load `.env` files. Set the variables as OS environment variables, or update the defaults directly in `application.yml` for local development.

### Google Cloud Console Setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application type).
3. Under **Authorised JavaScript origins**, add:
   ```
   http://localhost:5173
   ```
4. Copy the Client ID into `application.yml` (or set `GOOGLE_CLIENT_ID` env var).

### Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Configure `frontend/.env`

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=/api
```

> Vite only reads `.env` at startup — restart the dev server after any changes.

Frontend runs at:

```text
http://localhost:5173
```

---

## API Endpoints

### Authentication

| Method | Endpoint         | Access |
| ------ | ---------------- | ------ |
| POST   | /api/auth/google | Public |
| GET    | /api/auth/me     | Authenticated |

### Student APIs

| Method | Endpoint                     | Access  |
| ------ | ---------------------------- | ------- |
| POST   | /api/attendance/mark         | STUDENT |
| GET    | /api/attendance/history      | STUDENT |
| GET    | /api/attendance/status/today | STUDENT |

### Admin APIs

| Method | Endpoint                | Access |
| ------ | ----------------------- | ------ |
| GET    | /api/admin/pending      | ADMIN  |
| POST   | /api/admin/approve/{id} | ADMIN  |
| POST   | /api/admin/reject/{id}  | ADMIN  |
| GET    | /api/admin/reports      | ADMIN  |
| GET    | /api/admin/stats/daily  | ADMIN  |

---

## Email Domain Configuration

Allowed email domains are controlled by a single comma-separated config value — no code changes required to add or remove domains:

**`application.yml`**
```yaml
app:
  allowed-domains: kitsw.ac.in,gmail.com
```

Or via environment variable:
```env
ALLOWED_EMAIL_DOMAINS=kitsw.ac.in,gmail.com
```

Users from any other domain will receive a `403 Forbidden` error with a clear message listing the accepted domains.

---

## Production Deployment

### Backend Build

```bash
cd backend
mvn clean package -DskipTests
java -jar target/attendance-1.0.0.jar
```

### Frontend Build

```bash
cd frontend
npm run build
# Serve the dist/ folder via Nginx or any static file server
```

---

## Future Improvements

* Face recognition verification
* Email notifications for attendance approval/rejection
* Attendance export to Excel/PDF
* Real-time admin dashboard (WebSocket)
* Docker containerization
* Cloud storage integration (S3/GCS)

---

## Security Considerations

* Use HTTPS in production
* Generate a strong JWT secret (`openssl rand -base64 64`)
* Restrict allowed IP ranges to college network only
* Enable MongoDB authentication in production
* Never commit `.env` files to version control
* Rotate the JWT secret periodically

---

## Author

Abhilash

GitHub: https://github.com/Abhilash1406
