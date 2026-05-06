# Database Schema Documentation

## Overview

This document describes the complete database schema for the Task & Schedule Manager application.

## Entity Relationship Diagram

```
┌─────────────────────┐
│       Users         │
│─────────────────────│
│ id (PK)             │
│ name                │
│ email (UNIQUE)      │
│ password            │
│ role                │
│ created_at          │
└─────────────────────┘
         │
         │ 1:N (owner)
         ▼
┌─────────────────────┐
│      Projects       │
│─────────────────────│
│ id (PK)             │
│ name                │
│ description         │
│ status              │
│ owner_id (FK)       │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│       Tasks         │
│─────────────────────│
│ id (PK)             │
│ title               │
│ description         │
│ priority            │
│ status              │
│ project_id (FK)     │
│ assignee_id (FK)    │◄─── N:1 ─── Users
│ scheduled_start     │
│ scheduled_end       │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

## Tables

### users

Stores user account information and authentication credentials.

| Column     | Type         | Constraints                    | Description                          |
|------------|--------------|--------------------------------|--------------------------------------|
| id         | UUID         | PRIMARY KEY, DEFAULT uuid_v4() | Unique user identifier               |
| name       | VARCHAR(255) | NOT NULL                       | User's full name                     |
| email      | VARCHAR(255) | NOT NULL, UNIQUE               | User's email address (login)         |
| password   | VARCHAR(255) | NOT NULL                       | Bcrypt hashed password               |
| role       | ENUM         | NOT NULL, DEFAULT 'MEMBER'     | User role: ADMIN or MEMBER           |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT now()        | Account creation timestamp           |

**Indexes:**
- `PK_users_id` - Primary key on `id`
- `IDX_users_email` - Unique index on `email`
- `IDX_users_email_lookup` - Performance index for email lookups

**Relationships:**
- One user can own many projects (1:N via `projects.owner_id`)
- One user can be assigned many tasks (1:N via `tasks.assignee_id`)

### projects

Stores project information for organizing tasks.

| Column      | Type         | Constraints                    | Description                          |
|-------------|--------------|--------------------------------|--------------------------------------|
| id          | UUID         | PRIMARY KEY, DEFAULT uuid_v4() | Unique project identifier            |
| name        | VARCHAR(255) | NOT NULL                       | Project name                         |
| description | TEXT         | NULLABLE                       | Project description                  |
| status      | ENUM         | NOT NULL, DEFAULT 'ACTIVE'     | Project status: ACTIVE or ARCHIVED   |
| owner_id    | UUID         | NOT NULL, FK → users.id        | User who created the project         |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT now()        | Project creation timestamp           |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT now()        | Last update timestamp                |

**Indexes:**
- `PK_projects_id` - Primary key on `id`
- `IDX_projects_owner_id` - Index on `owner_id` for filtering by owner
- `IDX_projects_status` - Index on `status` for filtering by status
- `IDX_projects_name` - Index on `name` for search functionality

**Constraints:**
- `FK_projects_owner_id` - Foreign key to `users.id` (CASCADE on delete)

**Relationships:**
- Many projects belong to one user (N:1 via `owner_id`)
- One project can have many tasks (1:N via `tasks.project_id`)

### tasks

Stores task information with scheduling details.

| Column          | Type         | Constraints                    | Description                          |
|-----------------|--------------|--------------------------------|--------------------------------------|
| id              | UUID         | PRIMARY KEY, DEFAULT uuid_v4() | Unique task identifier               |
| title           | VARCHAR(255) | NOT NULL                       | Task title                           |
| description     | TEXT         | NULLABLE                       | Task description                     |
| priority        | ENUM         | NOT NULL                       | Priority: LOW, MEDIUM, HIGH, URGENT  |
| status          | ENUM         | NOT NULL, DEFAULT 'TODO'       | Status: TODO, IN_PROGRESS, DONE      |
| project_id      | UUID         | NOT NULL, FK → projects.id     | Project this task belongs to         |
| assignee_id     | UUID         | NOT NULL, FK → users.id        | User assigned to this task           |
| scheduled_start | TIMESTAMP    | NOT NULL                       | Task start date/time                 |
| scheduled_end   | TIMESTAMP    | NOT NULL                       | Task end date/time                   |
| created_at      | TIMESTAMP    | NOT NULL, DEFAULT now()        | Task creation timestamp              |
| updated_at      | TIMESTAMP    | NOT NULL, DEFAULT now()        | Last update timestamp                |

**Indexes:**
- `PK_tasks_id` - Primary key on `id`
- `IDX_tasks_project_id` - Index on `project_id` for filtering by project
- `IDX_tasks_assignee_id` - Index on `assignee_id` for filtering by assignee
- `IDX_tasks_status` - Index on `status` for filtering by status
- `IDX_tasks_priority` - Index on `priority` for filtering by priority
- `IDX_tasks_scheduled_start` - Index on `scheduled_start` for date queries
- `IDX_tasks_scheduled_end` - Index on `scheduled_end` for date queries
- `IDX_tasks_assignee_schedule` - Composite index on `(assignee_id, scheduled_start, scheduled_end)` for conflict detection
- `IDX_tasks_project_status` - Composite index on `(project_id, status)` for project task queries

**Constraints:**
- `FK_tasks_project_id` - Foreign key to `projects.id` (CASCADE on delete)
- `FK_tasks_assignee_id` - Foreign key to `users.id` (CASCADE on delete)
- `CHK_tasks_scheduled_dates` - Check constraint ensuring `scheduled_end > scheduled_start`

**Relationships:**
- Many tasks belong to one project (N:1 via `project_id`)
- Many tasks are assigned to one user (N:1 via `assignee_id`)

## Enums

### user_role_enum
- `ADMIN` - Full system access
- `MEMBER` - Limited access (default)

### project_status_enum
- `ACTIVE` - Project is active (default)
- `ARCHIVED` - Project is archived (soft delete)

### task_priority_enum
- `LOW` - Low priority
- `MEDIUM` - Medium priority
- `HIGH` - High priority
- `URGENT` - Urgent priority

### task_status_enum
- `TODO` - Not started (default)
- `IN_PROGRESS` - Currently being worked on
- `DONE` - Completed

## Indexes Strategy

### Performance Indexes

1. **Email Lookup** (`IDX_users_email_lookup`)
   - Used for: Login authentication
   - Query: `SELECT * FROM users WHERE email = ?`

2. **Project Filtering** (`IDX_projects_status`, `IDX_projects_owner_id`)
   - Used for: Listing projects by status or owner
   - Query: `SELECT * FROM projects WHERE status = ? AND owner_id = ?`

3. **Task Filtering** (`IDX_tasks_status`, `IDX_tasks_priority`)
   - Used for: Filtering tasks by status or priority
   - Query: `SELECT * FROM tasks WHERE status = ? AND priority = ?`

4. **Schedule Queries** (`IDX_tasks_scheduled_start`, `IDX_tasks_scheduled_end`)
   - Used for: Finding tasks in date ranges
   - Query: `SELECT * FROM tasks WHERE scheduled_start >= ? AND scheduled_end <= ?`

### Composite Indexes

1. **Conflict Detection** (`IDX_tasks_assignee_schedule`)
   - Used for: Finding overlapping tasks for the same assignee
   - Query: `SELECT * FROM tasks WHERE assignee_id = ? AND scheduled_start < ? AND scheduled_end > ?`

2. **Project Task Summary** (`IDX_tasks_project_status`)
   - Used for: Counting tasks by status for a project
   - Query: `SELECT status, COUNT(*) FROM tasks WHERE project_id = ? GROUP BY status`

## Constraints

### Foreign Key Constraints

All foreign keys use `CASCADE` on delete to maintain referential integrity:

- When a user is deleted, their owned projects and assigned tasks are deleted
- When a project is deleted, all its tasks are deleted
- This ensures no orphaned records

### Check Constraints

1. **Scheduled Date Validation** (`CHK_tasks_scheduled_dates`)
   - Ensures `scheduled_end > scheduled_start`
   - Prevents invalid date ranges
   - Enforced at database level

### Unique Constraints

1. **Email Uniqueness** (`IDX_users_email`)
   - Ensures each email is used by only one user
   - Prevents duplicate accounts
   - Enforced at database level

## Data Types

### UUID
- Used for all primary keys
- Generated using `uuid_generate_v4()`
- Provides globally unique identifiers
- Better for distributed systems

### VARCHAR(255)
- Used for short text fields (name, email, title)
- Fixed maximum length for performance
- Indexed fields use VARCHAR for efficiency

### TEXT
- Used for long text fields (description)
- No length limit
- Not indexed (full-text search would require special index)

### TIMESTAMP
- Used for all date/time fields
- Stores timezone information
- Supports date range queries

### ENUM
- Used for fields with fixed set of values
- Type-safe at database level
- Better performance than VARCHAR with CHECK constraint

## Query Patterns

### Common Queries

1. **User Login**
```sql
SELECT id, name, email, role, created_at
FROM users
WHERE email = $1;
```

2. **List Projects**
```sql
SELECT p.*, u.name as owner_name, u.email as owner_email
FROM projects p
JOIN users u ON p.owner_id = u.id
WHERE p.status = 'ACTIVE'
ORDER BY p.created_at DESC
LIMIT 10 OFFSET 0;
```

3. **Get Project Tasks**
```sql
SELECT t.*, u.name as assignee_name, u.email as assignee_email
FROM tasks t
JOIN users u ON t.assignee_id = u.id
WHERE t.project_id = $1
ORDER BY t.scheduled_start ASC;
```

4. **Schedule View**
```sql
SELECT t.*, p.name as project_name, u.name as assignee_name
FROM tasks t
JOIN projects p ON t.project_id = p.id
JOIN users u ON t.assignee_id = u.id
WHERE t.scheduled_start >= $1 AND t.scheduled_end <= $2
ORDER BY t.scheduled_start ASC;
```

5. **Conflict Detection**
```sql
SELECT t1.*, t2.id as conflict_id
FROM tasks t1
JOIN tasks t2 ON t1.assignee_id = t2.assignee_id
  AND t1.id != t2.id
  AND t1.scheduled_start < t2.scheduled_end
  AND t1.scheduled_end > t2.scheduled_start
WHERE t1.assignee_id = $1;
```

## Migration History

| Version           | Name          | Description                    | Date       |
|-------------------|---------------|--------------------------------|------------|
| 1704067200000     | InitialSchema | Create all tables and indexes  | 2024-01-01 |

## Schema Evolution

When making schema changes:

1. **Never modify existing migrations** - Create new ones
2. **Use migrations for all changes** - Don't use `synchronize: true`
3. **Test both up and down** - Ensure rollback works
4. **Update this document** - Keep schema docs current

## Performance Considerations

### Index Usage
- All foreign keys are indexed
- Frequently filtered fields are indexed
- Composite indexes for common query patterns
- Avoid over-indexing (each index has write cost)

### Query Optimization
- Use `EXPLAIN ANALYZE` to verify index usage
- Avoid `SELECT *` in production code
- Use pagination for large result sets
- Consider materialized views for complex aggregations

### Scaling Considerations
- UUID primary keys support horizontal scaling
- Indexes support efficient queries up to millions of rows
- Consider partitioning tasks table by date if needed
- Connection pooling configured in database module

## Backup and Recovery

### Backup Strategy
```bash
# Full database backup
pg_dump -U postgres task_schedule_manager > backup.sql

# Schema only
pg_dump -U postgres --schema-only task_schedule_manager > schema.sql

# Data only
pg_dump -U postgres --data-only task_schedule_manager > data.sql
```

### Restore
```bash
# Restore full backup
psql -U postgres task_schedule_manager < backup.sql

# Restore schema then data
psql -U postgres task_schedule_manager < schema.sql
psql -U postgres task_schedule_manager < data.sql
```

## Security

### Password Storage
- Passwords are hashed using bcrypt
- Never store plain text passwords
- Hash is stored in `users.password` column

### SQL Injection Prevention
- TypeORM uses parameterized queries
- Never concatenate user input into SQL
- All queries use placeholders ($1, $2, etc.)

### Access Control
- Database credentials in environment variables
- Connection pooling limits concurrent connections
- Foreign key constraints prevent orphaned data
