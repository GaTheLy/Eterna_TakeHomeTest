# Implementation Plan: Task & Schedule Manager

## Overview

This implementation plan covers the complete development of a full-stack Task & Schedule Manager system with:
- **Backend**: NestJS REST API with JWT authentication, TypeORM, and PostgreSQL
- **Frontend**: React.js dashboard with responsive design and state management
- **DevOps**: Docker Compose setup for local development
- **Testing**: Unit tests and E2E tests for critical functionality

The implementation follows a bottom-up approach: database → backend API → frontend UI → deployment → documentation.

## Tasks

### 1. Project Setup and Database Foundation

- [x] 1.1 Initialize NestJS backend project with TypeScript configuration
  - Create new NestJS project with CLI
  - Configure TypeScript with strict mode
  - Set up project structure (modules, controllers, services, entities)
  - Install core dependencies: @nestjs/typeorm, typeorm, pg, bcrypt, @nestjs/jwt, @nestjs/passport, class-validator, class-transformer
  - _Requirements: 14.1, 14.3, 16.4, 16.9_

- [x] 1.2 Configure PostgreSQL database connection with TypeORM
  - Set up TypeORM configuration with environment variables
  - Create database module
  - Configure connection pooling and logging
  - _Requirements: 7.9, 14.9_

- [x] 1.3 Create database entities (User, Project, Task) with TypeORM decorators
  - Implement User entity with role enum, password field, and timestamps
  - Implement Project entity with status enum, owner relationship, and timestamps
  - Implement Task entity with priority/status enums, relationships, and scheduled dates
  - Add foreign key constraints and cascade options
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 1.4 Create database migration scripts for schema creation
  - Generate initial migration for all entities
  - Add indexes for frequently queried fields (email, status, priority, scheduled dates)
  - Add unique constraints (User.email)
  - Add check constraints (scheduledEnd > scheduledStart, enum values)
  - _Requirements: 7.7, 7.8, 7.9_

- [x] 1.5 Create database seeder script with sample data
  - Create 2 users (admin@example.com and member@example.com with password123)
  - Create 3 projects with varied statuses and owners
  - Create 10+ tasks with varied priorities, statuses, and schedules
  - Include at least 2 overlapping tasks for conflict testing
  - _Requirements: 7.10, 7.11, 14.8_

- [x] 1.6 Write unit tests for entity validation logic
  - Test User entity validation (email format, password requirements)
  - Test Project entity validation (name length, status values)
  - Test Task entity validation (date constraints, enum values)
  - _Requirements: 8.1, 8.3_

### 2. Authentication and Authorization Module

- [x] 2.1 Implement Users module with service and repository
  - Create UsersService with findByEmail, findById, and create methods
  - Implement password hashing with bcrypt (salt rounds: 10)
  - Add user creation with default MEMBER role
  - _Requirements: 1.1, 1.6, 16.5_

- [x] 2.2 Implement Auth module with registration and login
  - Create AuthService with register and login methods
  - Implement registration: validate email uniqueness, hash password, create user
  - Implement login: validate credentials, generate JWT token
  - Create RegisterDto and LoginDto with class-validator decorators
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.7_

- [x] 2.3 Configure JWT strategy and authentication guards
  - Set up JWT module with secret and expiration from environment variables
  - Implement JwtStrategy to extract and validate JWT payload
  - Create JwtAuthGuard extending @nestjs/passport AuthGuard
  - Configure JWT expiration (default: 24 hours)
  - _Requirements: 1.7, 1.8, 5.1, 5.2, 5.3_

- [x] 2.4 Create custom decorators and roles guard
  - Implement @CurrentUser() decorator to extract user from request
  - Create RolesGuard for role-based access control
  - Implement @Roles() decorator for marking protected routes
  - _Requirements: 5.4, 5.5, 5.6_

- [x] 2.5 Create Auth controller with registration and login endpoints
  - POST /auth/register endpoint with validation
  - POST /auth/login endpoint returning JWT token and user data
  - Add Swagger decorators for API documentation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 15.5, 15.6_

- [x] 2.6 Write unit tests for AuthService
  - Test successful registration with password hashing
  - Test registration failure with duplicate email
  - Test successful login with valid credentials
  - Test login failure with invalid credentials
  - _Requirements: 8.1, 8.3_

- [x] 2.7 Write E2E tests for authentication endpoints
  - Test POST /auth/register with valid data (201 Created)
  - Test POST /auth/register with duplicate email (409 Conflict)
  - Test POST /auth/login with valid credentials (200 OK with JWT)
  - Test POST /auth/login with invalid credentials (401 Unauthorized)
  - _Requirements: 8.2, 8.4_

### 3. Projects Management Module

- [x] 3.1 Implement Projects module with service and repository
  - Create ProjectsService with CRUD methods
  - Implement create: set owner to current user, default status to ACTIVE
  - Implement findAll with pagination and search filtering
  - Implement findOne with task count grouped by status
  - Implement update: validate ownership, update fields and timestamp
  - Implement archive: set status to ARCHIVED (soft delete)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 16.5, 16.6_

- [x] 3.2 Create DTOs for project operations with validation
  - CreateProjectDto: name (required, 1-255 chars), description (optional, max 5000 chars)
  - UpdateProjectDto: name, description, status (all optional)
  - ProjectQueryDto: page, limit, search (all optional)
  - Add class-validator decorators for all fields
  - _Requirements: 2.8, 6.7_

- [x] 3.3 Create Projects controller with REST endpoints
  - GET /projects with pagination and search query parameters
  - POST /projects with JWT authentication
  - GET /projects/:id with task summary
  - PATCH /projects/:id with ownership validation
  - DELETE /projects/:id (archive) with ownership validation
  - Add Swagger decorators for API documentation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 3.4 Write unit tests for ProjectsService
  - Test create project with valid data
  - Test findAll with pagination
  - Test findAll with search filtering
  - Test findOne with task summary calculation
  - Test update project with ownership validation
  - Test archive project
  - _Requirements: 8.1, 8.3_

- [x] 3.5 Write E2E tests for projects endpoints
  - Test GET /projects with pagination (200 OK)
  - Test POST /projects with valid data (201 Created)
  - Test POST /projects without authentication (401 Unauthorized)
  - Test GET /projects/:id with task summary (200 OK)
  - Test PATCH /projects/:id by owner (200 OK)
  - Test DELETE /projects/:id by owner (204 No Content)
  - _Requirements: 8.2, 8.4_

### 4. Tasks Management Module

- [x] 4.1 Implement Tasks module with service and repository
  - Create TasksService with CRUD methods
  - Implement create: validate project and assignee exist, default status to TODO
  - Implement findByProject with filtering (status, priority, assignee) and sorting
  - Implement findOne with full task details
  - Implement update: validate date constraints, update fields and timestamp
  - Implement delete: hard delete from database
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 16.5, 16.6_

- [x] 4.2 Create DTOs for task operations with validation
  - CreateTaskDto: title, description, priority, assigneeId, scheduledStart, scheduledEnd (validate dates)
  - UpdateTaskDto: all fields optional, validate scheduledEnd > scheduledStart
  - TaskQueryDto: status, priority, assigneeId, sortBy, sortOrder (all optional)
  - Add class-validator decorators and custom date validation
  - _Requirements: 3.10, 3.11, 3.12, 3.13, 3.14, 6.7_

- [x] 4.3 Create Tasks controller with REST endpoints
  - GET /projects/:projectId/tasks with filtering and sorting query parameters
  - POST /projects/:projectId/tasks with JWT authentication
  - PATCH /tasks/:id with validation
  - DELETE /tasks/:id with JWT authentication
  - Add Swagger decorators for API documentation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 4.4 Write unit tests for TasksService
  - Test create task with valid data
  - Test create task with invalid date range (scheduledEnd before scheduledStart)
  - Test findByProject with status filter
  - Test findByProject with priority filter
  - Test findByProject with sorting by scheduledStart
  - Test update task with rescheduling
  - Test delete task
  - _Requirements: 8.1, 8.3_

- [x] 4.5 Write E2E tests for tasks endpoints
  - Test POST /projects/:projectId/tasks with valid data (201 Created)
  - Test POST /projects/:projectId/tasks with invalid dates (400 Bad Request)
  - Test GET /projects/:projectId/tasks with filters (200 OK)
  - Test PATCH /tasks/:id with valid data (200 OK)
  - Test DELETE /tasks/:id (204 No Content)
  - _Requirements: 8.2, 8.4_

### 5. Schedule Management and Conflict Detection

- [x] 5.1 Implement Schedule module with service
  - Create ScheduleService with getSchedule and detectConflicts methods
  - Implement getSchedule: query tasks within date range using TypeORM query builder
  - Implement detectConflicts: find overlapping tasks for same assignee
  - Use SQL queries with date range conditions and joins
  - _Requirements: 4.1, 4.2, 4.3, 16.5, 16.6_

- [x] 5.2 Create DTOs for schedule operations with validation
  - ScheduleQueryDto: start (required ISO 8601 date), end (required, must be after start)
  - Add class-validator decorators and custom date validation
  - _Requirements: 4.4, 6.7_

- [x] 5.3 Create Schedule controller with REST endpoints
  - GET /schedule with start and end query parameters
  - GET /schedule/conflicts returning grouped conflicts by assignee
  - Add Swagger decorators for API documentation
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 5.4 Write unit tests for ScheduleService
  - Test getSchedule returns tasks within date range
  - Test getSchedule excludes tasks outside date range
  - Test detectConflicts finds overlapping tasks for same assignee
  - Test detectConflicts ignores tasks for different assignees
  - Test detectConflicts handles edge cases (adjacent tasks, same start/end times)
  - _Requirements: 8.1, 8.3_

- [x] 5.5 Write E2E tests for schedule endpoints
  - Test GET /schedule with valid date range (200 OK)
  - Test GET /schedule with invalid date range (400 Bad Request)
  - Test GET /schedule/conflicts returns conflicts (200 OK)
  - _Requirements: 8.2, 8.4_

### 6. Global Error Handling and Validation

- [x] 6.1 Implement global exception filter
  - Create AllExceptionsFilter to catch all exceptions
  - Transform exceptions to consistent error response format
  - Include statusCode, message, errors array, timestamp, and path
  - Log errors with sanitized information (exclude sensitive data)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8_

- [x] 6.2 Configure global validation pipe
  - Set up ValidationPipe with whitelist, forbidNonWhitelisted, and transform options
  - Enable automatic type transformation
  - Configure detailed validation error messages
  - _Requirements: 5.7, 6.1, 6.7_

- [x] 6.3 Implement custom validation decorators
  - Create IsAfter decorator for date comparison validation
  - Add custom validators for business rules
  - _Requirements: 3.10, 4.4, 6.7_

- [x] 6.4 Write E2E tests for error handling
  - Test validation errors return 400 with detailed error messages
  - Test authentication errors return 401
  - Test authorization errors return 403
  - Test not found errors return 404
  - Test conflict errors return 409
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 8.2, 8.4_

### 7. Checkpoint - Backend API Complete

- [x] 7.1 Ensure all backend tests pass
  - Run all unit tests: `npm run test`
  - Run all E2E tests: `npm run test:e2e`
  - Verify test coverage for critical paths
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 8.5, 8.6_

- [x] 7.2 Test API manually with seed data
  - Run migrations and seed script
  - Test authentication flow (register → login → JWT)
  - Test project CRUD operations
  - Test task CRUD with filtering and sorting
  - Test schedule endpoints with conflict detection
  - Verify error responses for invalid inputs
  - _Requirements: 7.10, 7.11, 14.8_

### 8. Frontend Project Setup and Authentication

- [x] 8.1 Initialize React.js frontend project with TypeScript
  - Create new React app with TypeScript template
  - Configure TypeScript with strict mode
  - Set up project structure (pages, components, services, hooks, utils)
  - Install dependencies: react-router-dom, axios, react-hook-form, date-fns, react-datepicker
  - Install UI library (Tailwind CSS or Material-UI)
  - _Requirements: 14.1, 14.3, 16.7, 16.8_

- [x] 8.2 Create API client service with JWT interceptor
  - Implement ApiClient class with axios
  - Add request interceptor to inject JWT token from storage
  - Add response interceptor to handle 401 errors (redirect to login)
  - Implement error handling for network errors
  - _Requirements: 9.7, 9.8, 9.9, 16.8_

- [x] 8.3 Implement authentication service and state management
  - Create AuthContext with user, token, isAuthenticated state
  - Implement login, register, and logout functions
  - Store JWT token in localStorage
  - Create useAuth hook for consuming auth context
  - _Requirements: 9.4, 9.7, 13.1, 16.7_

- [x] 8.4 Create reusable UI components
  - Button component with variants (primary, secondary, danger)
  - Input component with error display
  - Modal component for dialogs
  - StatusBadge component with color coding for task/project status
  - LoadingSpinner component with size variants
  - ErrorMessage component with retry button
  - _Requirements: 11.14, 13.3, 13.6_

- [x] 8.5 Create Layout component with navigation
  - Implement Navbar with logo, navigation links, and logout button
  - Create Layout wrapper component
  - Add responsive navigation (hamburger menu for mobile)
  - _Requirements: 9.10, 13.6, 13.7_

- [x] 8.6 Implement registration page with form validation
  - Create RegisterPage with form (name, email, password fields)
  - Add client-side validation (email format, password min length, required fields)
  - Implement form submission calling auth service
  - Display validation errors inline
  - Navigate to login page on success
  - _Requirements: 9.1, 9.3, 9.5, 9.6, 16.7_

- [x] 8.7 Implement login page with form validation
  - Create LoginPage with form (email, password fields)
  - Add client-side validation
  - Implement form submission calling auth service
  - Store JWT token and navigate to projects list on success
  - Display error messages for invalid credentials
  - _Requirements: 9.2, 9.4, 9.5, 9.6, 16.7_

- [x] 8.8 Set up React Router with protected routes
  - Configure routes: /register, /login, /projects, /projects/:id, /schedule
  - Implement ProtectedRoute component checking authentication
  - Redirect to login if not authenticated
  - Redirect to projects if authenticated user visits login/register
  - _Requirements: 9.9, 9.10_

### 9. Projects Management Interface

- [x] 9.1 Create projects service for API calls
  - Implement getProjects with pagination and search parameters
  - Implement getProject by ID
  - Implement createProject
  - Implement updateProject
  - Implement deleteProject
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 16.8_

- [x] 9.2 Implement ProjectsListPage with table/card layout
  - Display projects in responsive table or card grid
  - Show project name, description, status, and creation date
  - Add search input with debounced filtering
  - Implement pagination controls (previous, next, page numbers)
  - Add "Create Project" button opening modal
  - Handle loading and error states
  - _Requirements: 10.1, 10.2, 10.5, 10.7, 10.8, 10.9, 13.4, 13.5_

- [x] 9.3 Create ProjectForm component for create/edit
  - Build form with name and description fields
  - Add validation (name required, description max length)
  - Implement submit handler calling projects service
  - Display API errors
  - Close modal and refresh list on success
  - _Requirements: 10.3, 10.4, 13.2_

- [x] 9.4 Implement responsive layout for projects list
  - Use CSS Grid or Flexbox for responsive card layout
  - Adapt table to cards on mobile screens
  - Test on screen widths down to 320px
  - _Requirements: 10.10, 13.7, 13.8_

### 10. Tasks Management Interface

- [x] 10.1 Create tasks service for API calls
  - Implement getTasks with projectId and query parameters
  - Implement createTask
  - Implement updateTask
  - Implement deleteTask
  - _Requirements: 11.1, 11.6, 11.9, 11.10, 11.11, 11.12, 16.8_

- [x] 10.2 Implement ProjectDetailPage with task list
  - Display project information (name, description, status)
  - Show task count grouped by status (TODO, IN_PROGRESS, DONE)
  - Display tasks in table or list format
  - Show task title, description, priority, status, assignee name, and scheduled dates
  - Add "Create Task" button opening modal
  - Handle loading and error states
  - _Requirements: 11.1, 11.2, 11.13, 13.4, 13.5_

- [x] 10.3 Create TaskFilters component
  - Add dropdown filters for status, priority, and assignee
  - Add sort options for scheduledStart and priority
  - Implement filter/sort change handlers updating query parameters
  - _Requirements: 11.3, 11.4, 11.5_

- [x] 10.4 Create TaskForm component for create/edit
  - Build form with title, description, priority, assignee, scheduledStart, scheduledEnd fields
  - Add date pickers for scheduledStart and scheduledEnd
  - Add validation (title required, scheduledEnd after scheduledStart)
  - Implement submit handler calling tasks service
  - Pre-fill form for edit mode
  - Display API errors
  - _Requirements: 11.6, 11.7, 11.8, 11.9, 11.11, 13.2_

- [x] 10.5 Implement task edit and delete functionality
  - Add edit button opening TaskForm with existing data
  - Add delete button with confirmation dialog
  - Refresh task list after edit/delete
  - _Requirements: 11.10, 11.11, 11.12_

- [x] 10.6 Implement responsive layout for task management
  - Adapt task table to cards on mobile screens
  - Ensure forms are usable on small screens
  - Test on screen widths down to 320px
  - _Requirements: 13.7, 13.8_

### 11. Schedule Visualization and Conflict Detection

- [x] 11.1 Create schedule service for API calls
  - Implement getSchedule with start and end date parameters
  - Implement getConflicts
  - _Requirements: 12.1, 12.2, 12.3, 12.6, 16.8_

- [x] 11.2 Implement ScheduleViewPage with date range selector
  - Add date range picker for start and end dates
  - Display selected date range
  - Fetch and display tasks within date range
  - Handle loading and error states
  - _Requirements: 12.1, 12.2, 12.3, 13.4, 13.5_

- [x] 11.3 Create Calendar component for schedule visualization
  - Integrate calendar library (react-big-calendar or FullCalendar)
  - Display tasks on calendar with scheduledStart and scheduledEnd
  - Show task title, assignee, and priority on calendar entries
  - Color-code tasks by priority or status
  - _Requirements: 12.4, 12.5_

- [x] 11.4 Implement conflict detection and highlighting
  - Add "Show Conflicts" button calling conflicts API
  - Highlight conflicting tasks visually (red border or background)
  - Display conflict details (overlapping assignee and time ranges)
  - Create ConflictAlert component showing conflict information
  - _Requirements: 12.6, 12.7, 12.8_

- [x] 11.5 Implement responsive layout for schedule view
  - Adapt calendar for mobile screens (switch to list view if needed)
  - Ensure date pickers are mobile-friendly
  - Test on screen widths down to 320px
  - _Requirements: 12.10, 13.7, 13.8_

### 12. Checkpoint - Frontend Complete

- [x] 12.1 Test all frontend features manually
  - Test registration and login flows
  - Test project CRUD operations
  - Test task CRUD with filtering and sorting
  - Test schedule view with date range selection
  - Test conflict detection
  - Verify responsive layout on mobile devices
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 11.1, 11.2, 12.1, 12.2_

- [x] 12.2 Verify error handling and loading states
  - Test API error scenarios (network errors, validation errors, 401, 404)
  - Verify loading spinners display during API calls
  - Verify error messages display correctly
  - Test retry functionality
  - _Requirements: 9.11, 9.12, 13.4, 13.5_

### 13. Docker Deployment Setup

- [~] 13.1 Create Dockerfile for backend API
  - Use Node.js base image
  - Copy package files and install dependencies
  - Copy source code and build TypeScript
  - Expose port 3000
  - Set CMD to run migrations, seed, and start server
  - _Requirements: 14.1, 14.2, 14.11_

- [~] 13.2 Create Dockerfile for frontend dashboard
  - Use Node.js base image for build stage
  - Build React app for production
  - Use nginx base image for serve stage
  - Copy build artifacts to nginx
  - Expose port 3001
  - _Requirements: 14.1, 14.2, 14.11_

- [~] 13.3 Create docker-compose.yml for multi-container setup
  - Define postgres service with persistent volume
  - Define api service depending on postgres
  - Define dashboard service depending on api
  - Configure environment variables for all services
  - Map ports: postgres (5432), api (3000), dashboard (3001)
  - _Requirements: 14.1, 14.2, 14.9, 14.10, 14.11, 14.12_

- [~] 13.4 Create .env.example file documenting environment variables
  - Document database connection variables (host, port, username, password, database)
  - Document JWT secret and expiration
  - Document API base URL for frontend
  - Add comments explaining each variable
  - _Requirements: 14.3, 14.9, 14.10_

- [~] 13.5 Test Docker Compose setup
  - Run `docker-compose up` and verify all services start
  - Verify database migrations run automatically
  - Verify seed data is populated
  - Test API endpoints from host machine
  - Test frontend dashboard from browser
  - Verify data persistence after container restart
  - _Requirements: 14.2, 14.8, 14.12_

### 14. Documentation and Final Polish

- [~] 14.1 Create comprehensive README.md
  - Add project overview and technology stack
  - Document setup instructions for local development
  - Document Docker Compose usage
  - List all API endpoints with HTTP methods, paths, and descriptions
  - Document authentication flow and JWT usage
  - Document request/response formats for key endpoints
  - Add technology choices and rationale section
  - Add potential improvements section (WebSocket, CI/CD, rate limiting, etc.)
  - Add time breakdown showing hours spent on each component
  - _Requirements: 14.4, 14.5, 14.6, 14.7, 15.5, 15.6, 15.7_

- [~] 14.2 Add API documentation with Swagger (optional)
  - Install @nestjs/swagger package
  - Add @ApiTags, @ApiOperation, @ApiResponse decorators to controllers
  - Add @ApiProperty decorators to DTOs
  - Configure Swagger module to expose /api/docs endpoint
  - Test interactive API documentation
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [~] 14.3 Create .gitignore file
  - Exclude node_modules, .env, build artifacts
  - Exclude IDE-specific files
  - Exclude database data files
  - _Requirements: 16.9_

- [~] 14.4 Review and clean up code
  - Remove console.log statements
  - Remove commented-out code
  - Ensure consistent code formatting
  - Verify all imports are used
  - Check for TypeScript errors
  - _Requirements: 16.4, 16.5, 16.6, 16.7, 16.8_

- [~] 14.5 Create incremental Git commits
  - Review commit history (should have 10+ commits)
  - Ensure commit messages follow conventional format (feat:, fix:, docs:, etc.)
  - Verify no sensitive data in commits
  - _Requirements: 16.1, 16.2, 16.3, 16.10_

### 15. Final Checkpoint - System Complete

- [~] 15.1 Run complete system test
  - Start system with Docker Compose
  - Test complete user workflow: register → login → create project → create tasks → view schedule → detect conflicts
  - Verify all features work end-to-end
  - Test on different browsers (Chrome, Firefox, Safari)
  - Test responsive layout on mobile devices
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 14.2, 14.4_

- [~] 15.2 Verify all requirements are met
  - Review requirements document and check each acceptance criterion
  - Verify all mandatory features are implemented
  - Document any optional features not implemented
  - _Requirements: All requirements_

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation follows a bottom-up approach: database → backend → frontend → deployment
- All code examples use TypeScript for type safety
- Focus on working software over perfect software - prioritize core features fully functional
- Testing strategy emphasizes example-based unit tests and E2E tests (no property-based tests needed for CRUD operations)
