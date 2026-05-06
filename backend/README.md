# Task & Schedule Manager - Backend API

NestJS REST API with JWT authentication, TypeORM, and PostgreSQL for the Task & Schedule Manager system.

## Technology Stack

- **NestJS**: Modern Node.js framework with TypeScript
- **TypeORM**: ORM for database interactions
- **PostgreSQL**: Relational database
- **JWT**: Stateless authentication
- **bcrypt**: Password hashing
- **class-validator**: Request validation

## Project Structure

```
src/
├── auth/              # Authentication module (JWT, guards, strategies)
│   ├── decorators/    # Custom decorators (@CurrentUser)
│   ├── dto/           # Data transfer objects
│   ├── guards/        # Auth guards (JWT, Roles)
│   └── strategies/    # Passport strategies
├── users/             # Users module
│   └── entities/      # User entity
├── projects/          # Projects management module
│   ├── dto/           # DTOs for project operations
│   └── entities/      # Project entity
├── tasks/             # Tasks management module
│   ├── dto/           # DTOs for task operations
│   └── entities/      # Task entity
├── schedule/          # Schedule and conflict detection module
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators
│   ├── filters/       # Exception filters
│   └── pipes/         # Validation pipes
└── database/          # Database configuration
    ├── migrations/    # Database migrations
    └── seeds/         # Seed data scripts
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create PostgreSQL database:
```bash
createdb task_schedule_manager
```

4. Run migrations (to be implemented in task 1.4):
```bash
npm run migration:run
```

5. Seed database (to be implemented in task 1.5):
```bash
npm run seed
```

## Development

### Run in development mode:
```bash
npm run start:dev
```

### Build for production:
```bash
npm run build
```

### Run tests:
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## TypeScript Configuration

The project uses strict TypeScript configuration with:
- `strict: true` - All strict type checking options enabled
- `noImplicitAny: true` - Error on expressions with implied 'any' type
- `strictNullChecks: true` - Strict null checking
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused parameters

## Core Dependencies

- `@nestjs/typeorm` - TypeORM integration for NestJS
- `typeorm` - ORM for database operations
- `pg` - PostgreSQL driver
- `bcrypt` - Password hashing
- `@nestjs/jwt` - JWT token generation and validation
- `@nestjs/passport` - Passport authentication integration
- `passport-jwt` - JWT strategy for Passport
- `class-validator` - Decorator-based validation
- `class-transformer` - Object transformation

## API Documentation

API documentation will be available at `/api/docs` (Swagger) once implemented in task 14.2.

## Next Steps

This is task 1.1 of the implementation plan. Next tasks will implement:
- Task 1.2: PostgreSQL database connection with TypeORM
- Task 1.3: Database entities (User, Project, Task)
- Task 1.4: Database migrations
- Task 1.5: Database seeder script
