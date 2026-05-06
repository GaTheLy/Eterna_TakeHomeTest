# Requirements Document

## Introduction

The Task & Schedule Manager is a full-stack project and task management system with scheduling capabilities for Eterna Indonesia's Full-Stack Developer assessment. The system enables users to create projects, assign tasks to projects, schedule tasks on a timeline, and detect scheduling conflicts. The system consists of a NestJS backend API with PostgreSQL database and a React.js frontend dashboard, demonstrating professional full-stack development practices.

## Glossary

- **System**: The complete Task & Schedule Manager application (backend + frontend + database)
- **API**: The NestJS backend REST API service
- **Dashboard**: The React.js frontend web application
- **Database**: The PostgreSQL relational database
- **User**: A registered person who can authenticate and use the system
- **Admin**: A User with role ADMIN who can manage all resources
- **Member**: A User with role MEMBER with limited permissions
- **Project**: A container for organizing related tasks
- **Task**: A work item with scheduling information assigned to a project
- **JWT**: JSON Web Token used for authentication
- **Assignee**: A User assigned to complete a Task
- **Owner**: A User who created a Project
- **Schedule_Conflict**: Two or more Tasks assigned to the same User with overlapping time ranges
- **Seed_Data**: Sample data populated in the Database for testing
- **Migration**: A versioned database schema change script
- **Guard**: A NestJS authorization mechanism that protects routes
- **Pipe**: A NestJS validation mechanism for request data
- **Exception_Filter**: A NestJS error handling mechanism
- **Decorator**: A TypeScript annotation that adds metadata or behavior
- **Soft_Delete**: Marking a record as deleted without removing it from the Database
- **Pagination**: Dividing large result sets into pages
- **State_Management**: Frontend pattern for managing application state
- **Responsive_Layout**: UI that adapts to different screen sizes
- **Docker_Compose**: Tool for defining multi-container Docker applications
- **E2E_Test**: End-to-end test that validates complete user workflows
- **Unit_Test**: Test that validates individual functions or classes

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a developer evaluating the system, I want users to register and authenticate securely, so that the system demonstrates proper security practices.

#### Acceptance Criteria

1. WHEN a registration request is received with valid name, email, and password, THE API SHALL create a new User with hashed password and role MEMBER
2. WHEN a registration request is received with an email that already exists, THE API SHALL return an error indicating the email is taken
3. WHEN a registration request is received with invalid data, THE API SHALL return validation errors describing the issues
4. WHEN a login request is received with valid credentials, THE API SHALL return a JWT token valid for authentication
5. WHEN a login request is received with invalid credentials, THE API SHALL return an authentication error
6. THE API SHALL hash passwords using a secure algorithm before storing in the Database
7. THE JWT SHALL contain the User id and role as claims
8. THE JWT SHALL expire after a configurable time period

### Requirement 2: Project Management

**User Story:** As a User, I want to create and manage projects, so that I can organize my tasks into logical groups.

#### Acceptance Criteria

1. WHEN an authenticated User creates a project with valid name and description, THE API SHALL create a Project with status ACTIVE and set the User as Owner
2. WHEN an authenticated User requests the project list, THE API SHALL return paginated Projects with page size and page number parameters
3. WHEN an authenticated User searches projects by name, THE API SHALL return Projects where the name contains the search term
4. WHEN an authenticated User requests a specific Project, THE API SHALL return the Project details with task count grouped by status
5. WHEN an authenticated User updates a Project they own, THE API SHALL update the Project fields and set updatedAt timestamp
6. WHEN an authenticated User deletes a Project they own, THE API SHALL archive the Project by setting status to ARCHIVED
7. WHEN an unauthenticated request is made to any project endpoint, THE API SHALL return an authentication error
8. THE API SHALL validate that project names are not empty and descriptions do not exceed reasonable length limits

### Requirement 3: Task Management

**User Story:** As a User, I want to create and manage tasks within projects, so that I can track work items with scheduling information.

#### Acceptance Criteria

1. WHEN an authenticated User creates a Task with valid title, description, priority, projectId, assigneeId, scheduledStart, and scheduledEnd, THE API SHALL create the Task with status TODO
2. WHEN an authenticated User requests tasks for a Project, THE API SHALL return Tasks belonging to that Project
3. WHEN an authenticated User filters tasks by status, THE API SHALL return only Tasks matching the specified status
4. WHEN an authenticated User filters tasks by priority, THE API SHALL return only Tasks matching the specified priority
5. WHEN an authenticated User filters tasks by assignee, THE API SHALL return only Tasks assigned to the specified User
6. WHEN an authenticated User sorts tasks by scheduledStart, THE API SHALL return Tasks ordered by scheduledStart date
7. WHEN an authenticated User sorts tasks by priority, THE API SHALL return Tasks ordered by priority level
8. WHEN an authenticated User updates a Task, THE API SHALL update the Task fields including rescheduling dates and set updatedAt timestamp
9. WHEN an authenticated User deletes a Task, THE API SHALL remove the Task from the Database
10. THE API SHALL validate that scheduledEnd is after scheduledStart for all Tasks
11. THE API SHALL validate that priority is one of LOW, MEDIUM, HIGH, or URGENT
12. THE API SHALL validate that status is one of TODO, IN_PROGRESS, or DONE
13. THE API SHALL validate that projectId references an existing Project
14. THE API SHALL validate that assigneeId references an existing User

### Requirement 4: Schedule Management and Conflict Detection

**User Story:** As a User, I want to view tasks across a date range and detect scheduling conflicts, so that I can manage resource allocation effectively.

#### Acceptance Criteria

1. WHEN an authenticated User requests the schedule with start and end date parameters, THE API SHALL return all Tasks where scheduledStart or scheduledEnd falls within the date range
2. WHEN an authenticated User requests schedule conflicts, THE API SHALL return Tasks where the same Assignee has overlapping scheduledStart and scheduledEnd times
3. THE API SHALL consider two Tasks as conflicting when they share the same Assignee and their time ranges overlap
4. THE API SHALL validate that the start date parameter is before the end date parameter
5. THE API SHALL return schedule results grouped by date or in chronological order

### Requirement 5: Authorization and Access Control

**User Story:** As a system administrator, I want role-based access control, so that Admins can manage all resources while Members have limited permissions.

#### Acceptance Criteria

1. THE API SHALL use JWT Guards to protect all authenticated endpoints
2. WHEN a request is made without a valid JWT, THE API SHALL return an authentication error with status code 401
3. WHEN a request is made with an expired JWT, THE API SHALL return an authentication error with status code 401
4. WHERE role-based access is implemented, WHEN an Admin requests any resource, THE API SHALL allow access
5. WHERE role-based access is implemented, WHEN a Member requests a resource they do not own, THE API SHALL return an authorization error with status code 403
6. THE API SHALL implement at least one custom Decorator for extracting the current User from the JWT
7. THE API SHALL validate request data using Pipes and class-validator before processing

### Requirement 6: Error Handling and Validation

**User Story:** As a developer, I want comprehensive error handling and validation, so that the system provides clear feedback for invalid requests.

#### Acceptance Criteria

1. WHEN a validation error occurs, THE API SHALL return a 400 status code with detailed error messages describing each validation failure
2. WHEN a resource is not found, THE API SHALL return a 404 status code with a descriptive error message
3. WHEN an authentication error occurs, THE API SHALL return a 401 status code with an appropriate error message
4. WHEN an authorization error occurs, THE API SHALL return a 403 status code with an appropriate error message
5. WHEN an unexpected server error occurs, THE API SHALL return a 500 status code and log the error details
6. THE API SHALL use Exception_Filters to handle errors consistently across all endpoints
7. THE API SHALL validate all request bodies using class-validator decorators
8. THE API SHALL sanitize error messages to avoid leaking sensitive information

### Requirement 7: Database Schema and Migrations

**User Story:** As a developer, I want a well-designed database schema with migrations, so that the system can evolve and be deployed reliably.

#### Acceptance Criteria

1. THE Database SHALL store Users with id, name, email, password, role, and createdAt fields
2. THE Database SHALL store Projects with id, name, description, status, ownerId, createdAt, and updatedAt fields
3. THE Database SHALL store Tasks with id, title, description, priority, status, projectId, assigneeId, scheduledStart, scheduledEnd, createdAt, and updatedAt fields
4. THE Database SHALL enforce foreign key constraints between Project.ownerId and User.id
5. THE Database SHALL enforce foreign key constraints between Task.projectId and Project.id
6. THE Database SHALL enforce foreign key constraints between Task.assigneeId and User.id
7. THE Database SHALL enforce unique constraints on User.email
8. THE Database SHALL use appropriate indexes for frequently queried fields
9. THE API SHALL use Migration scripts to create and modify the Database schema
10. THE API SHALL include a Seeder script that populates Seed_Data for testing
11. THE Seed_Data SHALL include at least 2 Users, 3 Projects, and 10 Tasks with varied statuses and schedules

### Requirement 8: Testing Coverage

**User Story:** As a developer, I want automated tests, so that the system's correctness can be verified and regressions prevented.

#### Acceptance Criteria

1. THE API SHALL include at least one Unit_Test that validates a service method or utility function
2. THE API SHALL include at least one E2E_Test that validates a complete API endpoint workflow
3. THE Unit_Test SHALL test business logic in isolation using mocks for dependencies
4. THE E2E_Test SHALL test authentication, request validation, and response format
5. THE tests SHALL be executable using a standard test command
6. THE tests SHALL provide clear output indicating pass or failure

### Requirement 9: Frontend Authentication and Navigation

**User Story:** As a User, I want to register, login, and navigate the Dashboard, so that I can access the system's features.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a registration form with fields for name, email, and password
2. THE Dashboard SHALL provide a login form with fields for email and password
3. WHEN a User submits valid registration data, THE Dashboard SHALL call the registration API and navigate to the login page
4. WHEN a User submits valid login credentials, THE Dashboard SHALL call the login API, store the JWT, and navigate to the projects list
5. WHEN a User submits invalid form data, THE Dashboard SHALL display validation errors without calling the API
6. THE Dashboard SHALL validate email format, password minimum length, and required fields
7. THE Dashboard SHALL store the JWT in browser storage for subsequent API requests
8. THE Dashboard SHALL include the JWT in the Authorization header for all authenticated API requests
9. WHEN an API request returns a 401 error, THE Dashboard SHALL redirect the User to the login page
10. THE Dashboard SHALL provide navigation between Projects List, Project Detail, and Schedule View pages
11. THE Dashboard SHALL display loading states while API requests are in progress
12. THE Dashboard SHALL display error messages when API requests fail

### Requirement 10: Project Management Interface

**User Story:** As a User, I want to view and manage projects in the Dashboard, so that I can organize my work visually.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Projects List page showing all Projects in a table or card layout
2. THE Dashboard SHALL provide a search input that filters Projects by name
3. THE Dashboard SHALL provide a create button that opens a form for creating new Projects
4. WHEN a User submits a valid project creation form, THE Dashboard SHALL call the create project API and refresh the Projects List
5. THE Dashboard SHALL display project name, description, status, and creation date for each Project
6. WHEN a User clicks on a Project, THE Dashboard SHALL navigate to the Project Detail page
7. THE Dashboard SHALL implement pagination controls for the Projects List
8. THE Dashboard SHALL display the current page number and total pages
9. THE Dashboard SHALL provide next and previous page buttons
10. THE Responsive_Layout SHALL adapt the Projects List for mobile screens

### Requirement 11: Task Management Interface

**User Story:** As a User, I want to view and manage tasks within projects, so that I can track and update work items.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Project Detail page showing Project information and associated Tasks
2. THE Dashboard SHALL display task count grouped by status on the Project Detail page
3. THE Dashboard SHALL provide filters for task status, priority, and assignee
4. THE Dashboard SHALL provide sort options for scheduledStart and priority
5. WHEN a User applies filters or sorting, THE Dashboard SHALL call the tasks API with appropriate query parameters
6. THE Dashboard SHALL provide a create task button that opens a Task Form
7. THE Task Form SHALL include fields for title, description, priority, assignee, scheduledStart, and scheduledEnd
8. THE Task Form SHALL use date pickers for scheduledStart and scheduledEnd fields
9. WHEN a User submits a valid Task Form, THE Dashboard SHALL call the create task API and refresh the task list
10. THE Dashboard SHALL provide edit and delete buttons for each Task
11. WHEN a User clicks edit, THE Dashboard SHALL open the Task Form pre-filled with existing Task data
12. WHEN a User clicks delete, THE Dashboard SHALL call the delete task API and refresh the task list
13. THE Dashboard SHALL display task title, description, priority, status, assignee name, and scheduled dates
14. THE Dashboard SHALL use a reusable StatusBadge component to display task status with color coding

### Requirement 12: Schedule Visualization

**User Story:** As a User, I want to view tasks on a calendar or timeline, so that I can visualize scheduling and identify conflicts.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Schedule View page displaying Tasks across a date range
2. THE Dashboard SHALL provide date range selectors for start and end dates
3. WHEN a User selects a date range, THE Dashboard SHALL call the schedule API and display Tasks within that range
4. THE Dashboard SHALL display Tasks in a calendar or timeline layout showing scheduledStart and scheduledEnd
5. THE Dashboard SHALL display task title, assignee, and priority on each calendar entry
6. THE Dashboard SHALL provide a conflicts button that calls the schedule conflicts API
7. WHEN conflicts are detected, THE Dashboard SHALL highlight conflicting Tasks visually
8. THE Dashboard SHALL display conflict details including overlapping Assignee and time ranges
9. WHERE drag-and-drop is implemented, WHEN a User drags a Task to a new date, THE Dashboard SHALL call the update task API with new scheduled dates
10. THE Responsive_Layout SHALL adapt the Schedule View for mobile screens

### Requirement 13: Frontend Architecture and State Management

**User Story:** As a developer, I want well-structured frontend code with proper state management, so that the Dashboard is maintainable and scalable.

#### Acceptance Criteria

1. THE Dashboard SHALL use State_Management for authentication state, user data, and API responses
2. THE Dashboard SHALL use form validation library for all forms
3. THE Dashboard SHALL implement at least one reusable component used in multiple pages
4. THE Dashboard SHALL handle loading states by displaying spinners or skeleton screens during API requests
5. THE Dashboard SHALL handle error states by displaying user-friendly error messages
6. THE Dashboard SHALL use consistent styling and component patterns across all pages
7. THE Responsive_Layout SHALL use CSS media queries or responsive framework to adapt to screen sizes
8. THE Dashboard SHALL be usable on mobile devices with screen widths down to 320px

### Requirement 14: Development Environment and Deployment

**User Story:** As a developer, I want a complete development environment setup, so that I can run and test the system locally.

#### Acceptance Criteria

1. THE System SHALL include a docker-compose.yml file that starts the API, Database, and Dashboard services
2. WHEN a developer runs docker-compose up, THE System SHALL start all services and be accessible
3. THE System SHALL include a .env.example file documenting all required environment variables
4. THE System SHALL include a README.md with setup instructions for local development
5. THE README.md SHALL document technology choices and rationale
6. THE README.md SHALL document potential improvements given more time
7. THE README.md SHALL include a time breakdown showing hours spent on each component
8. THE System SHALL include the Seeder script execution in the setup instructions
9. THE API SHALL expose environment variables for database connection, JWT secret, and JWT expiration
10. THE Dashboard SHALL expose environment variables for API base URL
11. THE System SHALL use separate Docker containers for API, Database, and Dashboard
12. THE Docker_Compose configuration SHALL include volume mounts for Database persistence

### Requirement 15: API Documentation

**User Story:** As a developer evaluating the system, I want API documentation, so that I can understand and test endpoints without reading code.

#### Acceptance Criteria

1. WHERE Swagger is implemented, THE API SHALL expose API documentation at /api/docs endpoint
2. WHERE Swagger is implemented, THE API SHALL document all endpoints with request and response schemas
3. WHERE Swagger is implemented, THE API SHALL document authentication requirements for protected endpoints
4. WHERE Swagger is implemented, THE API SHALL provide example requests and responses
5. THE README.md SHALL document all API endpoints with HTTP methods, paths, and descriptions
6. THE README.md SHALL document authentication flow and JWT usage
7. THE README.md SHALL document request and response formats for key endpoints

### Requirement 16: Code Quality and Git Practices

**User Story:** As a developer evaluating the system, I want clean code and git history, so that I can assess development practices and code quality.

#### Acceptance Criteria

1. THE System SHALL be stored in a Git repository with incremental commits
2. THE Git repository SHALL contain at least 10 commits showing progressive development
3. THE Git repository SHALL use descriptive commit messages following conventional commit format
4. THE API SHALL follow NestJS architectural patterns including modules, controllers, services, and DTOs
5. THE API SHALL use dependency injection for all services
6. THE API SHALL separate business logic from HTTP handling
7. THE Dashboard SHALL organize components into logical directories
8. THE Dashboard SHALL separate API client code from component code
9. THE System SHALL include a .gitignore file excluding node_modules, .env, and build artifacts
10. THE System SHALL not commit sensitive data such as passwords or API keys

### Requirement 17: WebSocket Notifications (Optional)

**User Story:** As a User, I want real-time notifications when tasks are assigned to me, so that I can respond quickly to new work.

#### Acceptance Criteria

1. WHERE WebSocket is implemented, WHEN a Task is created with an Assignee, THE API SHALL emit a notification event to the Assignee
2. WHERE WebSocket is implemented, THE Dashboard SHALL establish a WebSocket connection after authentication
3. WHERE WebSocket is implemented, WHEN a notification is received, THE Dashboard SHALL display a notification message
4. WHERE WebSocket is implemented, THE notification SHALL include task title, project name, and scheduled dates
5. WHERE WebSocket is implemented, THE Dashboard SHALL maintain the WebSocket connection while the User is authenticated

### Requirement 18: CI Pipeline (Optional)

**User Story:** As a developer, I want automated CI pipeline, so that tests run automatically on every commit.

#### Acceptance Criteria

1. WHERE CI is implemented, THE System SHALL include a GitHub Actions workflow configuration
2. WHERE CI is implemented, WHEN code is pushed to the repository, THE workflow SHALL install dependencies and run tests
3. WHERE CI is implemented, THE workflow SHALL run linting checks on the codebase
4. WHERE CI is implemented, THE workflow SHALL build the API and Dashboard to verify compilation
5. WHERE CI is implemented, THE workflow SHALL report success or failure status on the commit

