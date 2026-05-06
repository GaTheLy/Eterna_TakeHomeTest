# Backend API - Task & Schedule Manager

NestJS REST API with JWT authentication, WebSocket notifications, TypeORM, and PostgreSQL.

## 🏗️ Technology Stack

- **NestJS 11** - Progressive Node.js framework
- **TypeScript 5.7** - Strict type safety
- **PostgreSQL 15** - Relational database
- **TypeORM 0.3** - ORM with migration support
- **JWT** - Stateless authentication via Passport.js
- **Socket.io 4.8** - Real-time WebSocket notifications
- **bcrypt** - Password hashing
- **class-validator** - DTO validation
- **Swagger/OpenAPI** - API documentation
- **Jest** - Testing framework

---

## 📁 Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── decorators/          # @CurrentUser(), @Roles()
│   ├── dto/                 # LoginDto, RegisterDto
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── strategies/          # JWT strategy
│   ├── auth.controller.ts   # /auth endpoints
│   └── auth.service.ts      # Auth business logic
│
├── users/                   # User management
│   ├── entities/            # User entity
│   ├── users.service.ts     # User CRUD operations
│   └── users.module.ts
│
├── projects/                # Project management
│   ├── dto/                 # CreateProjectDto, UpdateProjectDto
│   ├── entities/            # Project entity
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   └── projects.module.ts
│
├── tasks/                   # Task management
│   ├── dto/                 # CreateTaskDto, UpdateTaskDto, FilterTasksDto
│   ├── entities/            # Task entity
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   └── tasks.module.ts
│
├── schedule/                # Schedule & conflict detection
│   ├── dto/                 # GetScheduleDto
│   ├── schedule.controller.ts
│   ├── schedule.service.ts
│   └── schedule.module.ts
│
├── notifications/           # WebSocket notifications
│   ├── notifications.gateway.ts
│   └── notifications.module.ts
│
├── database/                # Database configuration
│   ├── migrations/          # TypeORM migrations
│   ├── seeds/               # Seed data scripts
│   ├── data-source.ts       # TypeORM config
│   └── database.module.ts
│
├── common/                  # Shared utilities
│   ├── filters/             # Exception filters
│   ├── pipes/               # Validation pipes
│   └── decorators/          # Custom decorators
│
├── app.module.ts            # Root module
└── main.ts                  # Application entry point

test/                        # E2E tests
├── auth.e2e-spec.ts
├── projects.e2e-spec.ts
├── tasks.e2e-spec.ts
└── schedule.e2e-spec.ts
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- (Optional) Docker for containerized setup

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=task_schedule_manager
   
   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRATION=24h
   
   # Application
   PORT=3000
   NODE_ENV=development
   ```

3. **Create database:**
   ```bash
   createdb task_schedule_manager
   ```

4. **Run migrations:**
   ```bash
   npm run migration:run
   ```

5. **Seed database:**
   ```bash
   npm run seed
   ```

6. **Start development server:**
   ```bash
   npm run start:dev
   ```

API will be available at: **http://localhost:3000**  
Swagger docs at: **http://localhost:3000/api/docs**

---

## 🔧 Development Commands

### Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### Database Operations

```bash
# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate -- src/database/migrations/MigrationName

# Create empty migration
npm run migration:create -- src/database/migrations/MigrationName

# Seed database
npm run seed
```

### Code Quality

```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking
npx tsc --noEmit
```

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Run specific test file
npm test -- auth.service.spec.ts

# Run tests with verbose output
npm test -- --verbose
```

### Test Coverage

Current coverage:
- **246+ unit tests** across all modules
- **86+ E2E tests** for API endpoints
- **~80% code coverage**

Coverage by module:
- ✅ Auth module: 100%
- ✅ Users module: 95%
- ✅ Projects module: 90%
- ✅ Tasks module: 85%
- ✅ Schedule module: 90%
- ✅ Notifications module: 80%

---

## 📚 API Endpoints

### Authentication

```
POST   /auth/register          Register new user
POST   /auth/login             Login and get JWT token
GET    /auth/me                Get current user profile
```

### Projects

```
GET    /projects               List projects (pagination, search)
POST   /projects               Create project
GET    /projects/:id           Get project details with task summary
PATCH  /projects/:id           Update project
DELETE /projects/:id           Archive project
```

### Tasks

```
GET    /projects/:projectId/tasks    List tasks (filters, sorting)
POST   /projects/:projectId/tasks    Create task
GET    /tasks/:id                    Get task details
PATCH  /tasks/:id                    Update task
DELETE /tasks/:id                    Delete task
```

### Schedule

```
GET    /schedule                     Get tasks within date range
GET    /schedule/conflicts           Detect scheduling conflicts
```

### WebSocket Events

```
connect                    Client connects with userId
disconnect                 Client disconnects
task_assigned              Emitted when task is assigned to user
```

---

## 🔐 Authentication & Authorization

### JWT Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

**Request Header:**
```
Authorization: Bearer <jwt_token>
```

**Token Payload:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Role-Based Access Control

**Roles:**
- `ADMIN` - Full access to all resources
- `MEMBER` - Limited access (own resources only)

**Usage:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Get('admin-only')
adminOnlyEndpoint() {
  // Only accessible by ADMIN users
}
```

### Custom Decorators

**@CurrentUser()** - Get authenticated user in controller:
```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

**@Roles()** - Specify required roles:
```typescript
@Roles('ADMIN', 'MEMBER')
@Get('protected')
protectedRoute() {
  // Accessible by ADMIN or MEMBER
}
```

---

## 🗄️ Database

### Entities

**User Entity:**
```typescript
{
  id: string (UUID)
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'ADMIN' | 'MEMBER'
  createdAt: Date
}
```

**Project Entity:**
```typescript
{
  id: string (UUID)
  name: string
  description: string
  status: 'ACTIVE' | 'ARCHIVED'
  ownerId: string (FK → User)
  owner: User (relation)
  tasks: Task[] (relation)
  createdAt: Date
  updatedAt: Date
}
```

**Task Entity:**
```typescript
{
  id: string (UUID)
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  projectId: string (FK → Project)
  assigneeId: string (FK → User)
  project: Project (relation)
  assignee: User (relation)
  scheduledStart: Date
  scheduledEnd: Date
  createdAt: Date
  updatedAt: Date
}
```

### Migrations

Migrations are located in `src/database/migrations/`.

**Initial Schema Migration:**
- Creates users, projects, and tasks tables
- Sets up foreign key relationships
- Creates indexes for performance

**Running Migrations:**
```bash
# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Seed Data

Seed script creates:
- 2 users (admin and regular member)
- 3 projects
- 10+ tasks with various statuses and schedules

**Running Seeds:**
```bash
npm run seed
```

---

## 🔌 WebSocket Notifications

### Connection

**Client connects with userId:**
```javascript
const socket = io('http://localhost:3000', {
  query: { userId: 'user-uuid' }
});
```

### Events

**task_assigned** - Emitted when a task is assigned:
```json
{
  "taskId": "task-uuid",
  "title": "Task title",
  "projectName": "Project name",
  "message": "You have been assigned to task: Task title"
}
```

### Implementation

The `NotificationsGateway` tracks user connections and sends targeted notifications:

```typescript
// Send notification to specific user
this.notificationsGateway.sendNotification(
  userId,
  'task_assigned',
  { taskId, title, projectName, message }
);
```

---

## 🛡️ Error Handling

### Global Exception Filter

All errors are caught and formatted consistently:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/projects"
}
```

### Common HTTP Status Codes

- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid JWT
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error

---

## 📊 Validation

### DTO Validation

All request bodies are validated using `class-validator`:

**Example - CreateTaskDto:**
```typescript
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsUUID()
  assigneeId: string;

  @IsDateString()
  scheduledStart: string;

  @IsDateString()
  scheduledEnd: string;
}
```

**Validation Errors:**
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "priority must be a valid enum value"
  ],
  "error": "Bad Request"
}
```

---

## 🚀 Production Deployment

### Environment Variables

**Required for production:**
```env
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=strong-password
DB_DATABASE=task_schedule_manager

JWT_SECRET=strong-random-secret-min-32-chars
JWT_EXPIRATION=24h

PORT=3000
NODE_ENV=production
```

### Build & Run

```bash
# Build
npm run build

# Run production server
npm run start:prod
```

### Docker Deployment

```bash
# Build image
docker build -t task-schedule-api .

# Run container
docker run -p 3000:3000 \
  -e DB_HOST=postgres \
  -e JWT_SECRET=your-secret \
  task-schedule-api
```

### Health Checks

```bash
# Check API health
curl http://localhost:3000

# Check database connection
curl http://localhost:3000/api/docs
```

---

## 🔧 Configuration

### TypeScript Configuration

Strict mode enabled:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### CORS Configuration

CORS is enabled for all origins in development. For production:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

### Swagger Configuration

API documentation is available at `/api/docs` with:
- All endpoints documented
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -U postgres -d task_schedule_manager

# Check environment variables
echo $DB_HOST $DB_PORT $DB_USERNAME
```

### Migration Issues

```bash
# Check migration status
npm run migration:show

# Revert and re-run
npm run migration:revert
npm run migration:run

# Drop database and start fresh
dropdb task_schedule_manager
createdb task_schedule_manager
npm run migration:run
npm run seed
```

### Test Failures

```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- auth.service.spec.ts
```

---

## 📝 Development Notes

### Code Style

- Use TypeScript strict mode
- Follow NestJS conventions
- Use dependency injection
- Write tests for all services
- Document complex logic
- Use meaningful variable names

### Best Practices

- ✅ Use DTOs for all request/response data
- ✅ Validate all inputs with class-validator
- ✅ Use guards for authentication/authorization
- ✅ Handle errors with exception filters
- ✅ Write unit tests for services
- ✅ Write E2E tests for controllers
- ✅ Use transactions for multi-step operations
- ✅ Index database columns used in queries
- ✅ Use environment variables for configuration
- ✅ Document API with Swagger decorators

---

## 📄 License

This project is a take-home assessment for Eterna Indonesia.

---

**Built with NestJS and TypeScript** 🚀
