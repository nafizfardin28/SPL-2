# 🚀 AcademiX — Academic Management System

AcademiX is a full-stack academic management platform built for the Software Project Lab (SPL-2) course. It digitizes academic, financial, and administrative processes for an institute like PHS, University of Dhaka — bringing students, teachers, staff, and admins onto a single system for notices, semester fee payments, testimonials, ECA certificates, and budget requests.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Option A: Run with Docker](#option-a-run-with-docker-recommended)
  - [Option B: Run Locally](#option-b-run-locally)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Team](#team)
- [License](#license)

---

## Features

### 🔐 Authentication
- Registration, login, and OTP-based email verification
- JWT-based session authentication
- Password hashing with bcrypt, forgot/reset password flow
- Role-based access control (Student, Teacher, Staff, Admin)

### 🧑‍🎓 Student
- Personal dashboard
- Pay semester fees (SSLCommerz integration)
- Apply for testimonials and ECA certificates
- Submit and track budget requests
- View notices

### 👨‍🏫 Teacher
- Review and confirm ECA applications
- Approve/reject student budget requests

### 🧑‍💼 Staff
- Process testimonial requests
- Allocate/verify semester payments

### 🛡️ Admin
- User & role management
- Notice management
- Payment oversight
- Testimonial and ECA certificate approval
- Budget control
- PDF certificate generation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express 5 |
| Database | MySQL 8 |
| Auth | JWT, bcrypt |
| Payments | SSLCommerz |
| Email | Nodemailer |
| PDF Generation | PDFKit |
| Infra | Docker, Docker Compose, Nginx |

---

## Project Structure

```
spl-2/
├── src/                     # React frontend
│   ├── api/                 # Axios instance & auth API calls
│   ├── components/          # Shared UI (Navbar, Sidebar, ProtectedRoute)
│   ├── layouts/              # Page layouts
│   ├── pages/
│   │   ├── Admin/           # Admin dashboards & management pages
│   │   ├── Auth/            # Login, register, OTP, profile, etc.
│   │   ├── Staff/           # Staff-facing pages
│   │   ├── Student/         # Student-facing pages
│   │   └── Teacher/         # Teacher-facing pages
│   ├── store/                # Auth state store
│   └── utils/                # Feature-specific service calls (notices, budgets, ECA, etc.)
│
├── backend/                 # Node.js/Express API
│   ├── config/               # DB connection & initialization
│   ├── middleware/           # Auth middleware
│   ├── routes/                # Express route definitions
│   ├── services/              # Email service
│   ├── utils/                 # Auth helpers
│   ├── init.sql               # Database schema (used by Docker MySQL init)
│   └── server.js               # App entry point
│
├── public/                  # Static frontend assets
├── docker-compose.yml       # MySQL + backend + frontend orchestration
├── Dockerfile.frontend      # Multi-stage build: React build → Nginx
└── backend/Dockerfile       # Backend container image
```

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose **or**
- Node.js 20+, npm, and a local MySQL 8 instance

### Option A: Run with Docker (recommended)

This spins up MySQL, the backend API, and the frontend (served via Nginx) together.

```bash
git clone https://github.com/nafizfardin28/SPL-2.git
cd SPL-2
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- MySQL: `localhost:3306`

The MySQL container auto-initializes its schema from [backend/init.sql](backend/init.sql) on first run. Update the default credentials in [docker-compose.yml](docker-compose.yml) (`MYSQL_ROOT_PASSWORD`, `JWT_SECRET`, etc.) before deploying anywhere beyond local development.

### Option B: Run Locally

**1. Clone the repository**
```bash
git clone https://github.com/nafizfardin28/SPL-2.git
cd SPL-2
```

**2. Set up the database**
- Install and start MySQL
- Create a database and import [backend/init.sql](backend/init.sql)

**3. Backend setup**
```bash
cd backend
npm install
cp .env.example .env   # fill in your DB, JWT, and email credentials
npm start
```
The API runs on `http://localhost:5000` by default.

**4. Frontend setup**
```bash
# from the project root
npm install
npm start
```
The app runs on `http://localhost:3000` by default.

---

## Environment Variables

**Backend** — `backend/.env` (see [backend/.env.example](backend/.env.example)):

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default `5000`) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection settings |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD` | Bootstrap admin account credentials |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | SMTP settings for OTP/notification emails |

**Frontend** — `.env` at the project root:

| Variable | Description |
|---|---|
| `REACT_APP_API_BASE_URL` | Base URL of the backend API (e.g. `http://localhost:5000/api`) |

---

## API Overview

The backend exposes REST endpoints under `/api`, mounted in [backend/server.js](backend/server.js):

| Route prefix | Purpose |
|---|---|
| `/api/auth` | Registration, login, OTP verification, profile |
| `/api/notices` | Notice management |
| `/api/testimonials` | Testimonial requests & approvals |
| `/api/payments` | Semester payment records |
| `/api/budgets` | Budget request submission & approval |
| `/api/eca-certificates` | ECA certificate applications & confirmation |
| `/api/semester-fees` | Semester fee details |
| `/api/sslcommerz` | Payment gateway integration |

---

## Testing

```bash
npm test
```
Runs the React Testing Library / Jest suite via `react-scripts test`. API endpoints were also verified manually with Postman during development.

---

## Roadmap

- [ ] Mobile application
- [ ] AI-based recommendations
- [ ] Expanded payment gateway support
- [ ] Cloud deployment (AWS / Render)
- [ ] Real-time notifications

---

## Team

- G.M. Rashidul Islam Rahat
- Nafiz Mahmud Fardin

## License

This project was developed for academic purposes as part of the SPL-2 coursework.
