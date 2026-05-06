# Design Document: Task & Schedule Manager

## Overview

The Task & Schedule Manager is a full-stack project and task management system designed to demonstrate professional full-stack development practices for Eterna Indonesia's assessment. The system consists of three primary components:

1. **Backend API**: A NestJS REST API with JWT authentication, role-based access control, and comprehensive validation
2. **Frontend Dashboard**: A React.js single-page application with responsive design and state management
3. **Database**: A PostgreSQL relational database with proper schema design, migrations, and seed data

### Key Features

- **User Authentication**: Secure registration and login with JWT tokens and bcrypt password hashing
- **Project Management**: Create, read, update, and archive projects with ownership tracking
- **Task Management**: Full CRUD operations for tasks with scheduling, priority levels, and status tracking
- **Schedule Visualization**: Calendar/timeline view of tasks across date ranges with conflict detection
- **Role-Based Access Control**: Admin and Member roles with appropriate permission boundaries
- **Responsive UI**: Mobile-friendly dashboard that adapts to different screen sizes

### Design Philosophy

This system prioritizes:
- **Working software over perfect software**: Focus on a polished MVP with core features fully functional
- **Clear separation of concerns**: Backend business logic separated from HTTP handling; frontend API client separated from UI components
- **Type safety**: TypeScript throughout the stack with DTOs, validation, and proper typing
- **Developer experience**: Docker Compose for easy local setup, comprehensive README, and seed data for immediate testing
- **Professional patterns**: NestJS modules/services/controllers, React component composition, and proper error handling

## Architecture

### System Architecture

The system follows a three-tier architecture with clear boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │    State     │      │
│  │              │  │              │  │  Management  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                     ┌──────▼──────┐                         │
│                     │ API Client  │                         │
│                     └──────┬──────┘                         │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP/REST + JWT
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Backend API (NestJS)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │   Services   │  │     DTOs     │      │
│  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                  │                                │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────────────┐      │
│  │    Guards    │  │  Validators  │  │   Filters    │      │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                            │                                │
│                     ┌──────▼──────┐                         │
│                     │ TypeORM/    │                         │
│                     │ Prisma      │                         │
│                     └──────┬──────┘                         │
└────────────────────────────┼────────────────────────────────┘
                             │ SQL
                             │
┌────────────────────────────▼────────────────────────────────┐
│                  Database (PostgreSQL)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │   Projects   │  │    Tasks     │      │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- **NestJS**: Modern Node.js framework with TypeScript, dependency injection, and modular architecture
- **TypeORM or Prisma**: ORM for database interactions with migration support
- **PostgreSQL**: Robust relational database with ACID compliance
- **JWT**: Stateless authentication tokens
- **bcrypt**: Secure password hashing
- **class-validator**: Declarative validation with decorators
- **Jest**: Testing framework for unit and E2E tests

**Frontend:**
- **React.js**: Component-based UI library
- **React Router**: Client-side routing
- **State Management**: Context API, Zustand, or Redux (implementation choice)
- **Form Library**: react-hook-form or Formik for validation
- **Date Picker**: react-datepicker or similar for scheduling
- **Calendar Library**: react-big-calendar or FullCalendar for schedule visualization
- **Axios**: HTTP client for API communication
- **CSS Framework**: Tailwind CSS, Material-UI, or custom CSS

**DevOps:**
- **Docker**: Containerization for all services
- **Docker Compose**: Multi-container orchestration
- **Git**: Version control with incremental commits

### Deployment Architecture

```yaml
# docker-compose.yml structure
services:
  postgres:
    - Persistent volume for data
    - Port 5432 exposed
  
  api:
    - Depends on postgres
    - Port 3000 exposed
    - Environment variables from .env
    - Runs migrations and seeds on startup
  
  dashboard:
    - Depends on api
    - Port 3001 exposed
    - Environment variables for API URL
```

## Components and Interfaces

### Backend Components

#### Module Structure

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── entities/
│       └── user.entity.ts
├── projects/
│   ├── projects.module.ts
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   ├── dto/
│   │   ├── create-project.dto.ts
│   │   └── update-project.dto.ts
│   └── entities/
│       └── project.entity.ts
├── tasks/
│   ├── tasks.module.ts
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── dto/
│   │   ├── create-task.dto.ts
│   │   └── update-task.dto.ts
│   └── entities/
│       └── task.entity.ts
├── schedule/
│   ├── schedule.module.ts
│   ├── schedule.controller.ts
│   └── schedule.service.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── decorators/
│       └── roles.decorator.ts
└── database/
    ├── migrations/
    └── seeds/
```

#### Key Interfaces

**Auth Module:**
```typescript
// DTOs
class RegisterDto {
  name: string;
  email: string;
  password: string;
}

class LoginDto {
  email: string;
  password: string;
}

// Response
interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

// Service Interface
interface IAuthService {
  register(dto: RegisterDto): Promise<User>;
  login(dto: LoginDto): Promise<AuthResponse>;
  validateUser(email: string, password: string): Promise<User | null>;
}
```

**Projects Module:**
```typescript
// DTOs
class CreateProjectDto {
  name: string;
  description: string;
}

class UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

class ProjectQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

// Response
interface ProjectDetailResponse {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner: UserSummary;
  taskSummary: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Service Interface
interface IProjectsService {
  create(dto: CreateProjectDto, userId: string): Promise<Project>;
  findAll(query: ProjectQueryDto): Promise<PaginatedResponse<Project>>;
  findOne(id: string): Promise<ProjectDetailResponse>;
  update(id: string, dto: UpdateProjectDto, userId: string): Promise<Project>;
  archive(id: string, userId: string): Promise<void>;
}
```

**Tasks Module:**
```typescript
// DTOs
class CreateTaskDto {
  title: string;
  description: string;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
}

class UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
}

class TaskQueryDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sortBy?: 'scheduledStart' | 'priority';
  sortOrder?: 'ASC' | 'DESC';
}

// Service Interface
interface ITasksService {
  create(projectId: string, dto: CreateTaskDto): Promise<Task>;
  findByProject(projectId: string, query: TaskQueryDto): Promise<Task[]>;
  findOne(id: string): Promise<Task>;
  update(id: string, dto: UpdateTaskDto): Promise<Task>;
  delete(id: string): Promise<void>;
}
```

**Schedule Module:**
```typescript
// DTOs
class ScheduleQueryDto {
  start: Date;
  end: Date;
}

// Response
interface ScheduleConflict {
  assignee: UserSummary;
  conflictingTasks: Array<{
    id: string;
    title: string;
    projectName: string;
    scheduledStart: Date;
    scheduledEnd: Date;
  }>;
}

// Service Interface
interface IScheduleService {
  getSchedule(query: ScheduleQueryDto): Promise<Task[]>;
  detectConflicts(): Promise<ScheduleConflict[]>;
}
```

#### Guards and Decorators

**JWT Auth Guard:**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Validates JWT token from Authorization header
    return super.canActivate(context);
  }
}
```

**Roles Guard:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Checks if user has required role
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.some(role => user.role === role);
  }
}
```

**Current User Decorator:**
```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Extracted from JWT by JwtStrategy
  }
);
```

### Frontend Components

#### Component Structure

```
src/
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── projects/
│   │   ├── ProjectsListPage.tsx
│   │   └── ProjectDetailPage.tsx
│   └── schedule/
│       └── ScheduleViewPage.tsx
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Layout.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   └── ProjectTable.tsx
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskFilters.tsx
│   └── schedule/
│       ├── Calendar.tsx
│       ├── ConflictAlert.tsx
│       └── DateRangePicker.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── projects.service.ts
│   ├── tasks.service.ts
│   └── schedule.service.ts
├── store/
│   ├── authContext.tsx
│   └── useAuth.ts
├── hooks/
│   ├── useApi.ts
│   └── useForm.ts
└── utils/
    ├── validation.ts
    └── dateHelpers.ts
```

#### Key Component Interfaces

**API Client:**
```typescript
// Base API client with JWT injection
class ApiClient {
  private baseURL: string;
  private token: string | null;

  setToken(token: string): void;
  clearToken(): void;
  
  async get<T>(url: string, params?: any): Promise<T>;
  async post<T>(url: string, data: any): Promise<T>;
  async patch<T>(url: string, data: any): Promise<T>;
  async delete<T>(url: string): Promise<T>;
}

// Service interfaces
interface IAuthService {
  register(data: RegisterData): Promise<AuthResponse>;
  login(data: LoginData): Promise<AuthResponse>;
  logout(): void;
}

interface IProjectsService {
  getProjects(params: ProjectQueryParams): Promise<PaginatedResponse<Project>>;
  getProject(id: string): Promise<ProjectDetail>;
  createProject(data: CreateProjectData): Promise<Project>;
  updateProject(id: string, data: UpdateProjectData): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}

interface ITasksService {
  getTasks(projectId: string, params: TaskQueryParams): Promise<Task[]>;
  createTask(projectId: string, data: CreateTaskData): Promise<Task>;
  updateTask(id: string, data: UpdateTaskData): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}

interface IScheduleService {
  getSchedule(params: ScheduleQueryParams): Promise<Task[]>;
  getConflicts(): Promise<ScheduleConflict[]>;
}
```

**State Management:**
```typescript
// Auth Context
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

// Usage
const { user, isAuthenticated, login, logout } = useAuth();
```

**Reusable Components:**
```typescript
// StatusBadge component
interface StatusBadgeProps {
  status: TaskStatus | ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
}

// Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// LoadingSpinner component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}
```

## API Design

### API Design Principles

This API follows RESTful principles and industry best practices for API integration, emphasizing:

1. **Resource-Oriented Design**: URLs represent resources, not actions
2. **Consistent Naming**: Plural nouns for collections, clear hierarchies
3. **Proper HTTP Methods**: GET (read), POST (create), PATCH (partial update), DELETE (remove)
4. **Meaningful Status Codes**: Appropriate HTTP status codes for all responses
5. **Versioning Ready**: Structure supports future API versioning (e.g., `/api/v1/`)
6. **Pagination & Filtering**: Built-in support for large datasets
7. **Comprehensive Error Responses**: Structured error messages with actionable information
8. **Security First**: JWT authentication, input validation, and SQL injection prevention

### API Endpoint Specification

#### Authentication Endpoints

**POST /auth/register**
- **Purpose**: Register a new user account
- **Authentication**: None (public endpoint)
- **Request Body**:
```typescript
{
  name: string;        // 1-255 characters
  email: string;       // Valid email format, unique
  password: string;    // Minimum 8 characters
}
```
- **Success Response (201 Created)**:
```typescript
{
  id: string;          // UUID
  name: string;
  email: string;
  role: "MEMBER";      // Default role
  createdAt: string;   // ISO 8601 timestamp
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid input (validation errors)
  - `409 Conflict`: Email already exists

**POST /auth/login**
- **Purpose**: Authenticate user and receive JWT token
- **Authentication**: None (public endpoint)
- **Request Body**:
```typescript
{
  email: string;
  password: string;
}
```
- **Success Response (200 OK)**:
```typescript
{
  access_token: string;  // JWT token
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing credentials
  - `401 Unauthorized`: Invalid credentials

#### Project Endpoints

**GET /projects**
- **Purpose**: List all projects with pagination and search
- **Authentication**: Required (JWT)
- **Query Parameters**:
```typescript
{
  page?: number;       // Default: 1
  limit?: number;      // Default: 10, Max: 100
  search?: string;     // Filter by project name (case-insensitive)
}
```
- **Success Response (200 OK)**:
```typescript
{
  data: Array<{
    id: string;
    name: string;
    description: string;
    status: "ACTIVE" | "ARCHIVED";
    owner: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;      // Total number of projects
    totalPages: number;
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid JWT

**POST /projects**
- **Purpose**: Create a new project
- **Authentication**: Required (JWT)
- **Request Body**:
```typescript
{
  name: string;        // 1-255 characters, required
  description?: string; // Optional, max 5000 characters
}
```
- **Success Response (201 Created)**:
```typescript
{
  id: string;
  name: string;
  description: string;
  status: "ACTIVE";    // Default status
  ownerId: string;     // Current user's ID
  createdAt: string;
  updatedAt: string;
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation errors
  - `401 Unauthorized`: Missing or invalid JWT

**GET /projects/:id**
- **Purpose**: Get project details with task summary
- **Authentication**: Required (JWT)
- **Path Parameters**:
  - `id`: Project UUID
- **Success Response (200 OK)**:
```typescript
{
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "ARCHIVED";
  owner: {
    id: string;
    name: string;
    email: string;
  };
  taskSummary: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
  createdAt: string;
  updatedAt: string;
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid JWT
  - `404 Not Found`: Project does not exist

**PATCH /projects/:id**
- **Purpose**: Update project information
- **Authentication**: Required (JWT)
- **Authorization**: Owner or Admin only
- **Path Parameters**:
  - `id`: Project UUID
- **Request Body** (all fields optional):
```typescript
{
  name?: string;
  description?: string;
  status?: "ACTIVE" | "ARCHIVED";
}
```
- **Success Response (200 OK)**:
```typescript
{
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "ARCHIVED";
  ownerId: string;
  createdAt: string;
  updatedAt: string;  // Updated timestamp
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation errors
  - `401 Unauthorized`: Missing or invalid JWT
  - `403 Forbidden`: User is not owner or admin
  - `404 Not Found`: Project does not exist

**DELETE /projects/:id**
- **Purpose**: Archive a project (soft delete)
- **Authentication**: Required (JWT)
- **Authorization**: Owner or Admin only
- **Path Parameters**:
  - `id`: Project UUID
- **Success Response (204 No Content)**: Empty body
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid JWT
  - `403 Forbidden`: User is not owner or admin
  - `404 Not Found`: Project does not exist

#### Task Endpoints

**GET /projects/:projectId/tasks**
- **Purpose**: List tasks for a project with filtering and sorting
- **Authentication**: Required (JWT)
- **Path Parameters**:
  - `projectId`: Project UUID
- **Query Parameters**:
```typescript
{
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string;  // Filter by assignee UUID
  sortBy?: "scheduledStart" | "priority";
  sortOrder?: "ASC" | "DESC";  // Default: ASC
}
```
- **Success Response (200 OK)**:
```typescript
Array<{
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  };
  scheduledStart: string;  // ISO 8601 timestamp
  scheduledEnd: string;    // ISO 8601 timestamp
  createdAt: string;
  updatedAt: string;
}>
```
- **Error Responses**:
  - `400 Bad Request`: Invalid query parameters
  - `401 Unauthorized`: Missing or invalid JWT
  - `404 Not Found`: Project does not exist

**POST /projects/:projectId/tasks**
- **Purpose**: Create a new task in a project
- **Authentication**: Required (JWT)
- **Path Parameters**:
  - `projectId`: Project UUID
- **Request Body**:
```typescript
{
  title: string;           // 1-255 characters, required
  description?: string;    // Optional, max 5000 characters
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId: string;      // User UUID
  scheduledStart: string;  // ISO 8601 timestamp
  scheduledEnd: string;    // ISO 8601 timestamp (must be after scheduledStart)
}
```
- **Success Response (201 Created)**:
```typescript
{
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO";          // Default status
  projectId: string;
  assigneeId: string;
  scheduledStart: string;
  scheduledEnd: string;
  createdAt: string;
  updatedAt: string;
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation errors (e.g., scheduledEnd before scheduledStart)
  - `401 Unauthorized`: Missing or invalid JWT
  - `404 Not Found`: Project or assignee does not exist

**PATCH /tasks/:id**
- **Purpose**: Update task information (including rescheduling)
- **Authentication**: Required (JWT)
- **Path Parameters**:
  - `id`: Task UUID
- **Request Body** (all fields optional):
```typescript
{
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  assigneeId?: string;
  scheduledStart?: string;  // ISO 8601 timestamp
  scheduledEnd?: string;    // ISO 8601 timestamp
}
```
- **Success Response (200 OK)**:
```typescript
{
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string;
  assigneeId: string;
  scheduledStart: string;
  scheduledEnd: string;
  createdAt: string;
  updatedAt: string;  // Updated timestamp
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation errors
  - `401 Unauthorized`: Missing or invalid JWT
  - `404 Not Found`: Task does not exist

**DELETE /tasks/:id**
- **Purpose**: Delete a task permanently
- **Authentication**: Required (JWT)
- **Path Parameters**:
  - `id`: Task UUID
- **Success Response (204 No Content)**: Empty body
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid JWT
  - `404 Not Found`: Task does not exist

#### Schedule Endpoints

**GET /schedule**
- **Purpose**: Get all tasks within a date range across all projects
- **Authentication**: Required (JWT)
- **Query Parameters**:
```typescript
{
  start: string;  // ISO 8601 date (required)
  end: string;    // ISO 8601 date (required, must be after start)
}
```
- **Success Response (200 OK)**:
```typescript
Array<{
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  project: {
    id: string;
    name: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
  };
  scheduledStart: string;
  scheduledEnd: string;
}>
```
- **Error Responses**:
  - `400 Bad Request`: Missing or invalid date parameters
  - `401 Unauthorized`: Missing or invalid JWT

**GET /schedule/conflicts**
- **Purpose**: Detect scheduling conflicts (overlapping tasks for same assignee)
- **Authentication**: Required (JWT)
- **Success Response (200 OK)**:
```typescript
Array<{
  assignee: {
    id: string;
    name: string;
    email: string;
  };
  conflictingTasks: Array<{
    id: string;
    title: string;
    projectName: string;
    scheduledStart: string;
    scheduledEnd: string;
  }>;
}>
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid JWT

### API Design Best Practices Implementation

#### 1. Consistent Response Structure

All successful responses follow a predictable structure:
- **Single Resource**: Return the resource object directly
- **Collection**: Return array wrapped in object with `data` and `meta` fields
- **No Content**: Return 204 with empty body for DELETE operations

#### 2. Comprehensive Error Responses

All error responses include:
```typescript
{
  statusCode: number;      // HTTP status code
  message: string;         // Human-readable error message
  errors?: Array<{         // Optional detailed validation errors
    field: string;
    message: string;
  }>;
  timestamp: string;       // ISO 8601 timestamp
  path: string;           // Request path that caused the error
}
```

#### 3. Input Validation Strategy

**Request Body Validation:**
- Use `class-validator` decorators on DTOs
- Validate data types, formats, and business rules
- Return 400 with detailed field-level errors

**Query Parameter Validation:**
- Validate pagination parameters (page >= 1, limit <= 100)
- Validate date formats (ISO 8601)
- Validate enum values (status, priority, sortBy)

**Path Parameter Validation:**
- Validate UUID format for all ID parameters
- Return 404 if resource doesn't exist

#### 4. Authentication & Authorization Flow

**Authentication:**
1. Client sends JWT in `Authorization: Bearer <token>` header
2. JwtAuthGuard validates token signature and expiration
3. JwtStrategy extracts user payload and attaches to request
4. @CurrentUser() decorator provides access to authenticated user

**Authorization:**
1. RolesGuard checks user role against required roles
2. Service layer validates resource ownership
3. Return 403 if user lacks permission

#### 5. Query Optimization

**Pagination:**
- Default page size: 10
- Maximum page size: 100
- Return total count for client-side pagination UI

**Filtering:**
- Use query parameters for filters (status, priority, assignee)
- Support case-insensitive search for text fields
- Use database indexes for filtered fields

**Sorting:**
- Support sortBy and sortOrder parameters
- Default to natural ordering (createdAt DESC)
- Use database indexes for sorted fields

**Eager Loading:**
- Use `leftJoinAndSelect` to load related entities
- Avoid N+1 query problems
- Return nested objects instead of just IDs

#### 6. Date/Time Handling

**Format:** ISO 8601 (e.g., `2024-01-15T10:30:00.000Z`)
- Consistent across all endpoints
- Timezone-aware (UTC)
- Parseable by JavaScript Date, moment.js, date-fns

**Validation:**
- Validate date format on input
- Validate business rules (scheduledEnd > scheduledStart)
- Store as TIMESTAMP in database

#### 7. Idempotency

**Safe Methods (GET):**
- No side effects
- Cacheable responses
- Can be retried safely

**Idempotent Methods (PUT, DELETE):**
- Same result regardless of repetition
- DELETE returns 204 even if already deleted

**Non-Idempotent Methods (POST):**
- Creates new resources
- Returns 201 with created resource
- Consider idempotency keys for critical operations (future enhancement)

#### 8. Rate Limiting & Security (Future Enhancement)

**Planned Security Features:**
- Rate limiting per IP/user (e.g., 100 requests/minute)
- Request throttling for expensive operations
- CORS configuration for frontend domain
- Helmet.js for security headers
- SQL injection prevention via parameterized queries (ORM)
- XSS prevention via input sanitization

### API Integration Examples

#### Example 1: Complete User Registration & Login Flow

```typescript
// 1. Register new user
const registerResponse = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const newUser = await registerResponse.json();
// { id: "uuid", name: "John Doe", email: "john@example.com", role: "MEMBER", createdAt: "..." }

// 2. Login to get JWT token
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const authData = await loginResponse.json();
// { access_token: "eyJhbGc...", user: { id: "uuid", name: "John Doe", ... } }

// 3. Store token for subsequent requests
const token = authData.access_token;
```

#### Example 2: Create Project and Tasks

```typescript
// 1. Create a project
const projectResponse = await fetch('http://localhost:3000/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Website Redesign',
    description: 'Complete overhaul of company website'
  })
});

const project = await projectResponse.json();
// { id: "project-uuid", name: "Website Redesign", status: "ACTIVE", ... }

// 2. Create a task in the project
const taskResponse = await fetch(`http://localhost:3000/projects/${project.id}/tasks`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Design homepage mockup',
    description: 'Create high-fidelity mockup in Figma',
    priority: 'HIGH',
    assigneeId: authData.user.id,
    scheduledStart: '2024-01-15T09:00:00.000Z',
    scheduledEnd: '2024-01-15T17:00:00.000Z'
  })
});

const task = await taskResponse.json();
// { id: "task-uuid", title: "Design homepage mockup", status: "TODO", ... }
```

#### Example 3: Query Tasks with Filters

```typescript
// Get high-priority tasks assigned to current user, sorted by schedule
const tasksResponse = await fetch(
  `http://localhost:3000/projects/${projectId}/tasks?` +
  `priority=HIGH&assigneeId=${userId}&sortBy=scheduledStart&sortOrder=ASC`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const tasks = await tasksResponse.json();
// [{ id: "...", title: "...", priority: "HIGH", scheduledStart: "...", ... }]
```

#### Example 4: Detect Schedule Conflicts

```typescript
// Get all scheduling conflicts
const conflictsResponse = await fetch('http://localhost:3000/schedule/conflicts', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const conflicts = await conflictsResponse.json();
// [{
//   assignee: { id: "...", name: "John Doe", email: "..." },
//   conflictingTasks: [
//     { id: "...", title: "Task 1", scheduledStart: "...", scheduledEnd: "..." },
//     { id: "...", title: "Task 2", scheduledStart: "...", scheduledEnd: "..." }
//   ]
// }]
```

#### Example 5: Error Handling

```typescript
try {
  const response = await fetch('http://localhost:3000/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: '',  // Invalid: empty name
      description: 'Test'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    // {
    //   statusCode: 400,
    //   message: "Validation failed",
    //   errors: [{ field: "name", message: "name should not be empty" }],
    //   timestamp: "2024-01-15T10:30:00.000Z",
    //   path: "/projects"
    // }
    
    // Handle validation errors
    error.errors.forEach(err => {
      console.error(`${err.field}: ${err.message}`);
    });
  }
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
}
```

### API Documentation Strategy

**Swagger/OpenAPI Integration:**
- Install `@nestjs/swagger` package
- Decorate DTOs with `@ApiProperty()` for schema generation
- Decorate controllers with `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`
- Expose interactive documentation at `/api/docs`
- Provide "Try it out" functionality for testing endpoints

**Documentation Structure:**
- Endpoint grouping by resource (Auth, Projects, Tasks, Schedule)
- Request/response examples for each endpoint
- Authentication requirements clearly marked
- Error response examples for common scenarios

## Data Models

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                           User                               │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                 │
│     name: VARCHAR(255)                                       │
│ UQ  email: VARCHAR(255)                                      │
│     password: VARCHAR(255) -- bcrypt hashed                  │
│     role: ENUM('ADMIN', 'MEMBER')                            │
│     createdAt: TIMESTAMP                                     │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         │ 1                                  │ 1
         │                                    │
         │ owns                               │ assigned to
         │                                    │
         │ *                                  │ *
         ▼                                    ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│          Project             │    │            Task              │
├──────────────────────────────┤    ├──────────────────────────────┤
│ PK  id: UUID                 │    │ PK  id: UUID                 │
│     name: VARCHAR(255)       │    │     title: VARCHAR(255)      │
│     description: TEXT        │    │     description: TEXT        │
│     status: ENUM             │    │     priority: ENUM           │
│     ('ACTIVE', 'ARCHIVED')   │    │     ('LOW', 'MEDIUM',        │
│ FK  ownerId: UUID            │    │      'HIGH', 'URGENT')       │
│     createdAt: TIMESTAMP     │    │     status: ENUM             │
│     updatedAt: TIMESTAMP     │    │     ('TODO', 'IN_PROGRESS',  │
└──────────────────────────────┘    │      'DONE')                 │
         │                           │ FK  projectId: UUID          │
         │ 1                         │ FK  assigneeId: UUID         │
         │                           │     scheduledStart: TIMESTAMP│
         │ has                       │     scheduledEnd: TIMESTAMP  │
         │                           │     createdAt: TIMESTAMP     │
         │ *                         │     updatedAt: TIMESTAMP     │
         └───────────────────────────┤                              │
                                     └──────────────────────────────┘
```

### Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MEMBER')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Projects Table:**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

**Tasks Table:**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(20) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_start TIMESTAMP NOT NULL,
  scheduled_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT check_scheduled_dates CHECK (scheduled_end > scheduled_start)
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_scheduled_start ON tasks(scheduled_start);
CREATE INDEX idx_tasks_scheduled_end ON tasks(scheduled_end);
CREATE INDEX idx_tasks_schedule_range ON tasks(scheduled_start, scheduled_end);
```

### Entity Definitions

**User Entity (TypeORM):**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Project, project => project.owner)
  projects: Project[];

  @OneToMany(() => Task, task => task.assignee)
  assignedTasks: Task[];
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}
```

**Project Entity (TypeORM):**
```typescript
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE
  })
  status: ProjectStatus;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, user => user.projects)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}
```

**Task Entity (TypeORM):**
```typescript
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskPriority
  })
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, project => project.tasks)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'assignee_id' })
  assigneeId: string;

  @ManyToOne(() => User, user => user.assignedTasks)
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @Column({ name: 'scheduled_start', type: 'timestamp' })
  scheduledStart: Date;

  @Column({ name: 'scheduled_end', type: 'timestamp' })
  scheduledEnd: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}
```

### Data Validation Rules

**User Validation:**
- name: Required, 1-255 characters
- email: Required, valid email format, unique
- password: Required, minimum 8 characters, must be hashed before storage
- role: Must be 'ADMIN' or 'MEMBER', defaults to 'MEMBER'

**Project Validation:**
- name: Required, 1-255 characters, non-empty after trim
- description: Optional, max 5000 characters
- status: Must be 'ACTIVE' or 'ARCHIVED'
- ownerId: Required, must reference existing user

**Task Validation:**
- title: Required, 1-255 characters, non-empty after trim
- description: Optional, max 5000 characters
- priority: Required, must be 'LOW', 'MEDIUM', 'HIGH', or 'URGENT'
- status: Must be 'TODO', 'IN_PROGRESS', or 'DONE'
- projectId: Required, must reference existing project
- assigneeId: Required, must reference existing user
- scheduledStart: Required, valid ISO 8601 date
- scheduledEnd: Required, valid ISO 8601 date, must be after scheduledStart

### Seed Data Strategy

The seeder script will populate:

**Users (2):**
1. Admin user: admin@example.com / password123 / role: ADMIN
2. Member user: member@example.com / password123 / role: MEMBER

**Projects (3):**
1. "Website Redesign" - owned by admin, ACTIVE
2. "Mobile App Development" - owned by member, ACTIVE
3. "Legacy System Migration" - owned by admin, ARCHIVED

**Tasks (10+):**
- Mix of priorities (LOW, MEDIUM, HIGH, URGENT)
- Mix of statuses (TODO, IN_PROGRESS, DONE)
- Assigned to both users
- Scheduled across current month with some overlaps for conflict testing
- At least 2 tasks with overlapping schedules for the same assignee

## Error Handling

### Error Handling Strategy

The system implements comprehensive error handling at multiple layers to provide clear feedback and maintain system stability.

### Backend Error Handling

#### Exception Filter

A global exception filter handles all errors consistently:

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || message;
        errors = exceptionResponse['errors'] || null;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error details for debugging (sanitized for production)
    console.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      stack: exception instanceof Error ? exception.stack : null
    });

    // Return sanitized error response
    response.status(status).json({
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  }
}
```

#### Error Types and Status Codes

**400 Bad Request - Validation Errors:**
- Invalid input data (missing required fields, wrong format)
- Business rule violations (scheduledEnd before scheduledStart)
- Enum value violations (invalid status, priority, or role)

Example response:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be a valid email address"
    },
    {
      "field": "scheduledEnd",
      "message": "scheduledEnd must be after scheduledStart"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/tasks"
}
```

**401 Unauthorized - Authentication Errors:**
- Missing JWT token
- Invalid JWT token
- Expired JWT token
- Invalid credentials during login

Example response:
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/projects"
}
```

**403 Forbidden - Authorization Errors:**
- User attempting to access resource they don't own (when role-based access is enforced)
- Member attempting admin-only operations

Example response:
```json
{
  "statusCode": 403,
  "message": "Forbidden: You do not have permission to access this resource",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/projects/123"
}
```

**404 Not Found - Resource Not Found:**
- Project, task, or user not found by ID
- Invalid route

Example response:
```json
{
  "statusCode": 404,
  "message": "Project with ID '123' not found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/projects/123"
}
```

**409 Conflict - Business Logic Conflicts:**
- Duplicate email during registration
- Attempting to delete a project with active tasks (if enforced)

Example response:
```json
{
  "statusCode": 409,
  "message": "User with email 'user@example.com' already exists",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

**500 Internal Server Error - Unexpected Errors:**
- Database connection failures
- Unhandled exceptions
- Third-party service failures

Example response:
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/projects"
}
```

#### Validation Pipeline

All DTOs use class-validator decorators for automatic validation:

```typescript
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsUUID()
  projectId: string;

  @IsUUID()
  assigneeId: string;

  @IsDateString()
  scheduledStart: string;

  @IsDateString()
  scheduledEnd: string;

  @Validate(IsAfterConstraint, ['scheduledStart'])
  scheduledEndAfterStart: boolean;
}
```

The ValidationPipe is configured globally:

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip properties not in DTO
  forbidNonWhitelisted: true, // Throw error for extra properties
  transform: true,            // Auto-transform payloads to DTO instances
  transformOptions: {
    enableImplicitConversion: true
  }
}));
```

#### Database Error Handling

Database errors are caught and transformed into appropriate HTTP exceptions:

```typescript
async create(dto: CreateProjectDto, userId: string): Promise<Project> {
  try {
    const project = this.projectRepository.create({
      ...dto,
      ownerId: userId,
      status: ProjectStatus.ACTIVE
    });
    return await this.projectRepository.save(project);
  } catch (error) {
    if (error.code === '23503') { // Foreign key violation
      throw new BadRequestException('Invalid owner ID');
    }
    if (error.code === '23505') { // Unique constraint violation
      throw new ConflictException('Project with this name already exists');
    }
    throw new InternalServerErrorException('Failed to create project');
  }
}
```

### Frontend Error Handling

#### API Client Error Interceptor

The API client intercepts errors and handles them consistently:

```typescript
class ApiClient {
  private handleError(error: AxiosError): never {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Clear auth state and redirect to login
        this.clearToken();
        window.location.href = '/login';
      }
      
      throw {
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || null
      };
    } else if (error.request) {
      // Request made but no response
      throw {
        status: 0,
        message: 'Network error: Unable to reach server',
        errors: null
      };
    } else {
      // Error setting up request
      throw {
        status: 0,
        message: error.message,
        errors: null
      };
    }
  }
}
```

#### Component Error States

Components handle errors with user-friendly messages:

```typescript
function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);
        const data = await projectsService.getProjects();
        setProjects(data);
      } catch (err) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProjects} />;
  
  return <ProjectsList projects={projects} />;
}
```

#### Form Validation Errors

Forms display validation errors inline:

```typescript
function ProjectForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState(null);

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      await projectsService.createProject(data);
      navigate('/projects');
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {apiError && <ErrorMessage message={apiError} />}
      
      <Input
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />
      
      <Input
        {...register('description')}
        error={errors.description?.message}
      />
      
      <Button type="submit">Create Project</Button>
    </form>
  );
}
```

### Error Logging and Monitoring

**Backend Logging:**
- All errors logged with timestamp, request path, method, and stack trace
- Sensitive information (passwords, tokens) excluded from logs
- Production logs sent to centralized logging service (future enhancement)

**Frontend Logging:**
- API errors logged to console in development
- Production error tracking with service like Sentry (future enhancement)
- User-friendly error messages displayed in UI

## Testing Strategy

### Testing Approach

This system uses a pragmatic testing approach focused on critical functionality and demonstrating testing competency for the assessment. The testing strategy prioritizes:

1. **Example-based unit tests** for business logic and utility functions
2. **Integration tests** for API endpoints with database interactions
3. **E2E tests** for complete user workflows
4. **Manual testing** for UI/UX validation

**Note on Property-Based Testing:** This system is NOT suitable for property-based testing because it primarily consists of CRUD operations, database interactions, authentication/authorization, and UI rendering. These features are best validated through example-based tests and integration tests that verify specific scenarios and edge cases.

### Backend Testing

#### Unit Tests

Unit tests validate business logic in isolation using mocks for dependencies.

**Test Framework:** Jest with TypeScript support

**Example: Auth Service Unit Test**
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn()
    } as any;
    
    jwtService = {
      sign: jest.fn()
    } as any;
    
    service = new AuthService(usersService, jwtService);
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: '123',
        ...dto,
        password: 'hashed_password',
        role: UserRole.MEMBER,
        createdAt: new Date()
      });

      const result = await service.register(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(usersService.create).toHaveBeenCalled();
      expect(result.password).not.toBe(dto.password);
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      usersService.findByEmail.mockResolvedValue({
        id: '123',
        email: dto.email
      } as any);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const user = {
        id: '123',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.MEMBER
      };

      usersService.findByEmail.mockResolvedValue(user as any);

      const result = await service.validateUser('john@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
    });

    it('should return null if password is invalid', async () => {
      const user = {
        id: '123',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10)
      };

      usersService.findByEmail.mockResolvedValue(user as any);

      const result = await service.validateUser('john@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });
});
```

**Example: Schedule Service Unit Test**
```typescript
describe('ScheduleService', () => {
  let service: ScheduleService;
  let tasksRepository: jest.Mocked<Repository<Task>>;

  beforeEach(() => {
    tasksRepository = {
      createQueryBuilder: jest.fn()
    } as any;
    
    service = new ScheduleService(tasksRepository);
  });

  describe('detectConflicts', () => {
    it('should detect overlapping tasks for same assignee', async () => {
      const tasks = [
        {
          id: '1',
          title: 'Task 1',
          assigneeId: 'user1',
          scheduledStart: new Date('2024-01-15T09:00:00'),
          scheduledEnd: new Date('2024-01-15T11:00:00')
        },
        {
          id: '2',
          title: 'Task 2',
          assigneeId: 'user1',
          scheduledStart: new Date('2024-01-15T10:00:00'),
          scheduledEnd: new Date('2024-01-15T12:00:00')
        }
      ];

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tasks)
      };

      tasksRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const conflicts = await service.detectConflicts();

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflictingTasks).toHaveLength(2);
    });

    it('should not detect conflicts for different assignees', async () => {
      const tasks = [
        {
          id: '1',
          assigneeId: 'user1',
          scheduledStart: new Date('2024-01-15T09:00:00'),
          scheduledEnd: new Date('2024-01-15T11:00:00')
        },
        {
          id: '2',
          assigneeId: 'user2',
          scheduledStart: new Date('2024-01-15T10:00:00'),
          scheduledEnd: new Date('2024-01-15T12:00:00')
        }
      ];

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tasks)
      };

      tasksRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const conflicts = await service.detectConflicts();

      expect(conflicts).toHaveLength(0);
    });
  });
});
```

#### Integration Tests (E2E)

E2E tests validate complete API workflows with a test database.

**Test Setup:**
- Separate test database
- Database reset before each test suite
- Seed data for consistent test state

**Example: Projects E2E Test**
```typescript
describe('Projects (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and login to get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.access_token;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects', () => {
    it('should create a new project', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
          description: 'Test Description'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Test Project');
          expect(res.body.status).toBe('ACTIVE');
          expect(res.body.ownerId).toBe(userId);
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
          description: 'Test'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .send({
          name: 'Test Project',
          description: 'Test'
        })
        .expect(401);
    });
  });

  describe('GET /projects', () => {
    it('should return paginated projects', async () => {
      // Create test projects
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Project 1', description: 'Desc 1' });

      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Project 2', description: 'Desc 2' });

      return request(app.getHttpServer())
        .get('/projects?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
        });
    });

    it('should filter projects by search term', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Unique Project Name', description: 'Test' });

      return request(app.getHttpServer())
        .get('/projects?search=Unique')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0].name).toContain('Unique');
        });
    });
  });
});
```

**Example: Tasks E2E Test**
```typescript
describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let projectId: string;
  let assigneeId: string;

  beforeAll(async () => {
    // Setup app, auth, and create test project
    // ... (similar to projects test)
  });

  describe('POST /projects/:projectId/tasks', () => {
    it('should create a task with valid schedule', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          priority: 'HIGH',
          assigneeId,
          scheduledStart: '2024-01-15T09:00:00Z',
          scheduledEnd: '2024-01-15T11:00:00Z'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.status).toBe('TODO');
        });
    });

    it('should return 400 if scheduledEnd is before scheduledStart', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          priority: 'HIGH',
          assigneeId,
          scheduledStart: '2024-01-15T11:00:00Z',
          scheduledEnd: '2024-01-15T09:00:00Z'
        })
        .expect(400);
    });
  });

  describe('GET /schedule/conflicts', () => {
    it('should detect overlapping tasks', async () => {
      // Create two overlapping tasks
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task 1',
          priority: 'HIGH',
          assigneeId,
          scheduledStart: '2024-01-15T09:00:00Z',
          scheduledEnd: '2024-01-15T11:00:00Z'
        });

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task 2',
          priority: 'HIGH',
          assigneeId,
          scheduledStart: '2024-01-15T10:00:00Z',
          scheduledEnd: '2024-01-15T12:00:00Z'
        });

      return request(app.getHttpServer())
        .get('/schedule/conflicts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].conflictingTasks.length).toBe(2);
        });
    });
  });
});
```

### Frontend Testing

Frontend testing focuses on critical user interactions and component behavior.

**Test Framework:** Jest + React Testing Library

**Example: Login Form Test**
```typescript
describe('LoginPage', () => {
  it('should display validation errors for empty fields', async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('should call login API with valid credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      access_token: 'token',
      user: { id: '1', name: 'Test', email: 'test@example.com' }
    });

    render(<LoginPage onLogin={mockLogin} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

**Example: StatusBadge Component Test**
```typescript
describe('StatusBadge', () => {
  it('should render TODO status with correct styling', () => {
    render(<StatusBadge status="TODO" />);
    
    const badge = screen.getByText('TODO');
    expect(badge).toHaveClass('status-badge', 'status-todo');
  });

  it('should render IN_PROGRESS status with correct styling', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    
    const badge = screen.getByText('IN PROGRESS');
    expect(badge).toHaveClass('status-badge', 'status-in-progress');
  });

  it('should render DONE status with correct styling', () => {
    render(<StatusBadge status="DONE" />);
    
    const badge = screen.getByText('DONE');
    expect(badge).toHaveClass('status-badge', 'status-done');
  });
});
```

### Test Coverage Goals

**Backend:**
- Unit tests: Core business logic in services (auth, schedule conflict detection)
- E2E tests: At least one test per major endpoint (auth, projects, tasks, schedule)
- Minimum 1 unit test and 1 E2E test as required by assessment

**Frontend:**
- Component tests: Reusable components (StatusBadge, Modal, forms)
- Integration tests: Critical user flows (login, create project, create task)
- Focus on functionality over coverage percentage

### Test Execution

**Backend:**
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Run with coverage
npm run test:cov
```

**Frontend:**
```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Manual Testing Checklist

**Authentication:**
- [ ] Register new user with valid data
- [ ] Register with duplicate email shows error
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] JWT token persists across page refreshes
- [ ] Expired token redirects to login

**Projects:**
- [ ] Create project with valid data
- [ ] View projects list with pagination
- [ ] Search projects by name
- [ ] View project detail with task summary
- [ ] Update project information
- [ ] Archive project

**Tasks:**
- [ ] Create task with valid schedule
- [ ] Create task with invalid schedule shows error
- [ ] Filter tasks by status, priority, assignee
- [ ] Sort tasks by scheduled start and priority
- [ ] Update task including rescheduling
- [ ] Delete task

**Schedule:**
- [ ] View tasks in date range
- [ ] Detect and display schedule conflicts
- [ ] Conflict highlighting works correctly
- [ ] Calendar/timeline displays correctly

**Responsive Design:**
- [ ] Dashboard works on desktop (1920x1080)
- [ ] Dashboard works on tablet (768x1024)
- [ ] Dashboard works on mobile (375x667)
- [ ] Navigation adapts to screen size
- [ ] Forms are usable on mobile

**Error Handling:**
- [ ] Network errors display user-friendly messages
- [ ] Validation errors display inline
- [ ] 401 errors redirect to login
- [ ] 404 errors show appropriate message
- [ ] Loading states display during API calls

