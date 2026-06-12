# Smart Attendance Management System

A full-stack attendance management platform for college Training & Placement sessions with secure Google authentication, webcam-based attendance capture, admin approval workflows, and network-restricted access.

## Features

### Student Features

* Google OAuth login using college email
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

* Restricted to college email domain
* Restricted to college WiFi/IP ranges
* JWT authentication
* Automatic attendance photo cleanup
* Role-based access control

---

## Tech Stack

| Layer          | Technology                   |
| -------------- | ---------------------------- |
| Frontend       | React 18, Vite, Tailwind CSS |
| Backend        | Spring Boot 3.2, Java 21     |
| Database       | MongoDB                      |
| Authentication | Google OAuth 2.0 + JWT       |
| Build Tools    | Maven, npm                   |
| Deployment     | Nginx + Spring Boot          |

---

## Architecture

```text
Frontend (React)
        ↓
REST API (Spring Boot)
        ↓
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
│   ├── uploads/
│   └── pom.xml
│
└── frontend/
    ├── src/
    ├── public/
    └── package.json
```

---

## Key Functionalities

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

```bash
cd backend
cp .env.example .env
```

### Configure Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/smart_attendance
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
ALLOWED_EMAIL_DOMAIN=kitsw.ac.in
PHOTO_RETENTION_DAYS=7
```

### Run Backend

```bash
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
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## API Endpoints

### Authentication

| Method | Endpoint         |
| ------ | ---------------- |
| POST   | /api/auth/google |
| GET    | /api/auth/me     |

### Student APIs

| Method | Endpoint                     |
| ------ | ---------------------------- |
| POST   | /api/attendance/mark         |
| GET    | /api/attendance/history      |
| GET    | /api/attendance/status/today |

### Admin APIs

| Method | Endpoint                |
| ------ | ----------------------- |
| GET    | /api/admin/pending      |
| POST   | /api/admin/approve/{id} |
| POST   | /api/admin/reject/{id}  |
| GET    | /api/admin/reports      |

---

## Production Deployment

### Backend Build

```bash
mvn clean package -DskipTests
```

### Frontend Build

```bash
npm run build
```

---

## Future Improvements

* Face recognition verification
* Email notifications
* Attendance export to Excel/PDF
* Real-time admin dashboard
* Docker containerization
* Cloud storage integration

---

## Security Considerations

* Use HTTPS in production
* Secure JWT secrets
* Restrict allowed IP ranges
* Enable MongoDB authentication
* Never commit `.env` files

---

## Author

Abhilash

GitHub:
https://github.com/Abhilash1406
