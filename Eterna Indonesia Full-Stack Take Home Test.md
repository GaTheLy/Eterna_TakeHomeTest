# Full-Stack Developer Take-Home Assessment

## Project: Task \& Schedule Manager API + Dashboard

**Time limit:** 2 days from receipt
**Stack:** NestJS (backend) + React.js (frontend) + PostgreSQL
**Deliverable:** GitHub repository with README, docker-compose for local setup

\---

## Brief

Build a **Project \& Task Management** system with scheduling capabilities. The system allows users to create projects, assign tasks to projects, and schedule tasks on a timeline.

\---

## Requirements

### Backend (NestJS + TypeORM/Prisma + PostgreSQL)

#### Core Entities

1. **User** — id, name, email, password (hashed), role (ADMIN | MEMBER), createdAt
2. **Project** — id, name, description, status (ACTIVE | ARCHIVED), ownerId (FK → User), createdAt, updatedAt
3. **Task** — id, title, description, priority (LOW | MEDIUM | HIGH | URGENT), status (TODO | IN\_PROGRESS | DONE), projectId (FK → Project), assigneeId (FK → User), scheduledStart, scheduledEnd, createdAt, updatedAt

#### API Endpoints (REST)

**Auth**

* `POST /auth/register` — Register a new user
* `POST /auth/login` — Login, return JWT

**Projects** (authenticated)

* `GET /projects` — List projects (with pagination, search by name)
* `POST /projects` — Create a project
* `GET /projects/:id` — Get project detail with task summary (count by status)
* `PATCH /projects/:id` — Update project
* `DELETE /projects/:id` — Soft delete or archive

**Tasks** (authenticated)

* `GET /projects/:projectId/tasks` — List tasks (filterable by status, priority, assignee; sortable by scheduledStart, priority)
* `POST /projects/:projectId/tasks` — Create a task with schedule
* `PATCH /tasks/:id` — Update task (including reschedule)
* `DELETE /tasks/:id` — Delete task

**Schedule** (authenticated)

* `GET /schedule?start=DATE\\\&end=DATE` — Get all tasks within a date range (across projects)
* `GET /schedule/conflicts` — Return tasks with overlapping schedules for the same assignee

#### Backend Requirements

* JWT-based authentication with Guards
* Validation using `class-validator` / Pipes
* At least one custom decorator (e.g., `@CurrentUser()`)
* Proper error handling with exception filters
* Database migrations (not just sync)
* Seeder script to populate sample data
* At least one unit test and one e2e test

### Frontend (React.js)

#### Pages

1. **Login / Register** — Auth forms
2. **Projects List** — Table or card view with search, create button
3. **Project Detail** — Shows project info + task list with filters
4. **Task Form** — Create/edit modal or page with date pickers for scheduling
5. **Schedule View** — Calendar or timeline view showing tasks across a date range (can use a library like `react-big-calendar`, `@fullcalendar/react`, or a simple custom grid)

#### Frontend Requirements

* State management (React Context, Zustand, or Redux — candidate's choice)
* Form validation (react-hook-form, formik, or equivalent)
* Responsive layout (mobile-friendly)
* Loading states and error handling for API calls
* At least one reusable component (e.g., DataTable, Modal, StatusBadge)

### Bonus (Optional, not required)

* Role-based access (ADMIN can manage all, MEMBER only their own)
* Drag-and-drop task rescheduling on the calendar
* WebSocket notification when a task is assigned
* API documentation via Swagger (`@nestjs/swagger`)
* CI pipeline config (GitHub Actions)
* Dockerized setup with `docker-compose.yml`

\---

## Submission Guidelines

1. Push to a **public or private GitHub repo** (if private, invite the reviewer)
2. Include a `README.md` with:

   * Setup instructions (how to run locally)
   * Tech choices and rationale (why you chose X over Y)
   * What you would improve given more time
   * Time spent (rough breakdown)
3. Include a `.env.example` with all required environment variables
4. Provide seed data so reviewers can test immediately
5. Commit history should show incremental progress (not one giant commit)

\---

## What We're Evaluating

|Area|Weight|
|-|-|
|API design \& correctness|25%|
|Code structure \& NestJS patterns|20%|
|Database design \& query efficiency|15%|
|Frontend functionality \& UX|15%|
|Error handling \& validation|10%|
|Testing|10%|
|Documentation \& setup|5%|

We value **working software over perfect software**. A polished MVP is better than an incomplete ambitious attempt.

\---

