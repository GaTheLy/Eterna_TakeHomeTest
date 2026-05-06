# Database Migrations

This directory contains TypeORM migration files for the Task & Schedule Manager database schema.

## Overview

Migrations are versioned database schema changes that allow you to evolve your database structure over time while maintaining data integrity and enabling rollback capabilities.

## Migration Files

### 1704067200000-InitialSchema.ts

The initial database schema migration that creates:

**Tables:**
- `users` - User accounts with authentication credentials
- `projects` - Project containers for organizing tasks
- `tasks` - Work items with scheduling information

**Indexes:**
- `IDX_users_email` - Unique index on user email
- `IDX_users_email_lookup` - Performance index for email lookups
- `IDX_projects_owner_id` - Index for project owner queries
- `IDX_projects_status` - Index for filtering by project status
- `IDX_projects_name` - Index for project name search
- `IDX_tasks_project_id` - Index for task-project relationship
- `IDX_tasks_assignee_id` - Index for task-assignee relationship
- `IDX_tasks_status` - Index for filtering by task status
- `IDX_tasks_priority` - Index for filtering by task priority
- `IDX_tasks_scheduled_start` - Index for scheduling queries
- `IDX_tasks_scheduled_end` - Index for scheduling queries
- `IDX_tasks_assignee_schedule` - Composite index for conflict detection
- `IDX_tasks_project_status` - Composite index for project task queries

**Constraints:**
- `UNIQUE` constraint on `users.email`
- `FOREIGN KEY` constraints for all relationships
- `CHECK` constraint ensuring `scheduled_end > scheduled_start`
- Enum constraints for `role`, `status`, and `priority` fields

## Running Migrations

### Run all pending migrations
```bash
npm run migration:run
```

This command will:
1. Connect to the database
2. Check which migrations have already been run
3. Execute any pending migrations in order
4. Record the migration in the `migrations` table

### Revert the last migration
```bash
npm run migration:revert
```

This will undo the most recently applied migration.

### Show migration status
```bash
npm run migration:show
```

This displays which migrations have been run and which are pending.

### Generate a new migration (auto-detect changes)
```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

This will compare your entities with the current database schema and generate a migration file with the necessary changes.

### Create a blank migration
```bash
npm run migration:create -- src/database/migrations/MigrationName
```

This creates an empty migration file that you can manually populate.

## Migration Best Practices

1. **Never modify existing migrations** - Once a migration has been run in any environment, it should be considered immutable
2. **Always test migrations** - Test both `up` and `down` methods before committing
3. **Use descriptive names** - Migration names should clearly describe what they do
4. **Keep migrations small** - Each migration should represent a single logical change
5. **Handle data migrations carefully** - When changing data structure, ensure existing data is properly migrated
6. **Test rollback** - Always verify that the `down` method correctly reverses the `up` method

## Automatic Migration Execution

The application is configured to automatically run pending migrations on startup when `migrationsRun: true` is set in the database configuration. This ensures the database schema is always up-to-date when the application starts.

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR 255)
- `email` (VARCHAR 255, UNIQUE)
- `password` (VARCHAR 255, hashed)
- `role` (ENUM: ADMIN, MEMBER)
- `created_at` (TIMESTAMP)

### Projects Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR 255)
- `description` (TEXT, nullable)
- `status` (ENUM: ACTIVE, ARCHIVED)
- `owner_id` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tasks Table
- `id` (UUID, Primary Key)
- `title` (VARCHAR 255)
- `description` (TEXT, nullable)
- `priority` (ENUM: LOW, MEDIUM, HIGH, URGENT)
- `status` (ENUM: TODO, IN_PROGRESS, DONE)
- `project_id` (UUID, Foreign Key → projects.id)
- `assignee_id` (UUID, Foreign Key → users.id)
- `scheduled_start` (TIMESTAMP)
- `scheduled_end` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Troubleshooting

### Migration fails with "relation already exists"
This usually means the database already has tables created by TypeORM's `synchronize` feature. You can either:
1. Drop the database and recreate it
2. Manually drop the conflicting tables
3. Skip the initial migration if the schema is already correct

### Migration fails with "column does not exist"
Ensure you're running migrations in the correct order. Check `npm run migration:show` to see the status.

### Need to reset the database
```bash
# Drop all tables
psql -U postgres -d task_schedule_manager -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run migrations
npm run migration:run
```
