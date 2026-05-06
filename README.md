# Task & Schedule Manager

A full-stack project and task management system with real-time notifications, scheduling capabilities, and conflict detection. Built for the Eterna Indonesia Full-Stack Developer Assessment.

**Live Demo**: http://localhost:3001 (after setup)  
**API Documentation**: http://localhost:3000/api/docs

---

## 🛠️ Essential Information for Reviewers

### 🔧 Setup Instructions (How to run locally)

The easiest way to run the application is using **Docker Compose**:

```bash
# 1. Clone the repository
git clone https://github.com/GaTheLy/Eterna_TakeHomeTest.git
cd Eterna_TakeHomeTest

# 2. Start all services (Database, API, Dashboard)
docker-compose up --build
```

**Wait for about 30-60 seconds** for migrations and seeding to complete.
- **Frontend Dashboard**: http://localhost:3001
- **API Documentation (Swagger)**: http://localhost:3000/api/docs

**Sample Login Credentials:**
- **Email**: `admin@example.com`
- **Password**: `password123`

---

### 🏗️ Tech Choices & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend** | **NestJS 11** | Enterprise-grade architecture with built-in dependency injection, excellent TypeScript support, and modular structure that scales well. Chosen over Express for better long-term maintainability. |
| **ORM** | **TypeORM 0.3** | Mature TypeScript-first ORM with excellent migration support and flexibility in complex joins. |
| **Frontend** | **React 19** | Latest industry standard with component-based architecture and a massive ecosystem of specialized libraries like `react-big-calendar`. |
| **Build Tool** | **Vite 8** | Lightning-fast development experience with HMR and optimized production builds. |
| **Styling** | **Tailwind CSS** | Rapid UI development with a consistent design system and excellent responsive utility classes. |
| **Database** | **PostgreSQL** | Robust relational database necessary for the complex relationships between projects, tasks, and users. |
| **Real-time** | **Socket.io** | Reliable WebSocket implementation with automatic reconnection and fallback support. |

---

### 💡 What I Would Improve Given More Time

1.  **Comprehensive Frontend Testing**: While the backend has **80% coverage (246+ unit tests, 86+ E2E tests)**, the frontend would benefit from Vitest unit tests and Playwright E2E flows to ensure UI stability.
2.  **Performance & Caching**: Implement **Redis caching** for the schedule query and project lists to handle high-concurrency scenarios and reduce DB load.
3.  **Production Hardening**: Add **Rate Limiting**, **Refresh Token Rotation**, and **CSRF protection** to move beyond the current MVP/Assessment security level.
4.  **Advanced Conflict Resolution**: Implement a more interactive "Conflict Resolution Wizard" that allows users to swap tasks between team members directly from the conflict alert.

---

### ⏱️ Time Spent (Breakdown)

**Total Time: ~8 hours**

- **Backend Development (3.5h)**: Core API, Auth, Projects/Tasks CRUD, Conflict Detection logic, and unit/E2E testing.
- **Frontend Development (2.5h)**: UI structure, Auth context, Calendar integration, and responsive task management forms.
- **DevOps & Documentation (1h)**: Docker orchestration, CI/CD pipeline setup (GitHub Actions), and README documentation.
- **Debugging & UX Polish (1h)**: WebSocket stability, DnD library troubleshooting, and fine-tuning the visual calendar feedback.

---

## 🚀 Quick Start (Detailed)

### Prerequisites
- **Docker Desktop** installed and running
- At least **4GB of available RAM**
- Ports **3000**, **3001**, and **5432** available

### One-Command Setup

```bash
docker-compose up --build
```

That's it! The application will:
- Start PostgreSQL database
- Run database migrations
- Seed sample data
- Start backend API server (port 3000)
- Start frontend dashboard (port 3001)

### Access the Application

- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation (Swagger)**: http://localhost:3000/api/docs

---

## 📋 Features Implemented

### Core Requirements ✅

**Backend (NestJS + PostgreSQL):**
- ✅ User authentication with JWT
- ✅ Role-based access control (ADMIN/MEMBER)
- ✅ Projects CRUD with pagination and search
- ✅ Tasks CRUD with filtering, sorting, and scheduling
- ✅ Schedule view with date range filtering
- ✅ Conflict detection for overlapping schedules
- ✅ Database migrations with TypeORM
- ✅ Seed data script
- ✅ Comprehensive testing (246+ unit tests, 86+ E2E tests)
- ✅ Swagger/OpenAPI documentation

**Frontend (React + TypeScript):**
- ✅ Login/Register pages
- ✅ Projects list with search and create
- ✅ Project detail with task management
- ✅ Task form with date pickers
- ✅ Schedule/calendar view
- ✅ Responsive design (mobile-friendly)
- ✅ State management with React Context
- ✅ Loading states and error handling

### Bonus Features ✅

- ✅ **WebSocket Real-time Notifications** - Instant notifications when tasks are assigned
- ✅ **Drag & Drop Rescheduling** - Drag tasks on calendar to reschedule
- ✅ **CI/CD Pipeline** - GitHub Actions for automated testing and deployment
- ✅ **Docker Setup** - Complete containerization with docker-compose

---

## 🔧 Alternative: Local Development Setup (Without Docker)

If you prefer to run services locally without Docker:

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Create DB: createdb task_schedule_manager
npm run migration:run
npm run seed
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🧪 Testing

### Running Tests

```bash
# Backend
cd backend
npm test                    # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Coverage report

# Frontend
cd frontend
npx tsc --noEmit           # Type checking
npm run lint               # Linting
```

---

## 🚀 Deployment

### CI/CD Pipeline

GitHub Actions workflows are configured for automated testing, Docker build validation, and deployment readiness.

---

## 📚 API Documentation

Access Swagger UI at: **http://localhost:3000/api/docs**

---

## 🐳 Docker Commands

```bash
docker-compose up -d       # Start detached
docker-compose logs -f     # View logs
docker-compose down -v     # Stop and remove data
```

---

## 🆘 Troubleshooting

### Port Already in Use
If you get an `EADDRINUSE` error:
```bash
lsof -i :3000
kill -9 <PID>
```

---

## 📄 License

This project is a take-home assessment for Eterna Indonesia.

---

## 🙏 Acknowledgments

- **NestJS**, **React**, **TypeORM**, **Tailwind CSS**, and **Socket.io**.

---

**Built with ❤️ by Abelito Faleyrio Visese**
**Submission Date**: May 6, 2026
 team for the amazing frontend library
- **TypeORM** for the robust ORM
- **Tailwind CSS** for the utility-first CSS framework
- **Socket.io** for real-time communication
- **Eterna Indonesia** for the opportunity

