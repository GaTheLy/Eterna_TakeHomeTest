# Database Migration Guide

## Overview

This guide explains how to use database migrations in the Task & Schedule Manager backend application. Migrations provide a version-controlled way to manage database schema changes.

## What Are Migrations?

Migrations are TypeScript files that describe changes to your database schema. Each migration has:
- An `up()` method that applies the changes
- A `down()` method that reverts the changes
- A timestamp-based name for ordering

## Initial Setup

The initial migration (`1704067200000-InitialSchema.ts`) creates the complete database schema including:

### Tables Created
1. **users** - User accounts with authentication
2. **projects** - Project containers
3. **tasks** - Work items with scheduling

### Indexes Created
Performance indexes on frequently queried fields:
- User email (unique + lookup)
- Project owner, status, and name
- Task status, priority, assignee, and scheduled dates
- Composite indexes for complex queries

### Constraints Created
- **Unique**: `users.email` must be unique
- **Foreign Keys**: All relationships enforced
- **Check**: `tasks.scheduled_end > tasks.scheduled_start`
- **Enums**: Valid values for role, status, priority

## Migration Commands

### View Migration Status
```bash
npm run migration:show
```
Shows which migrations have been applied and which are pending.

### Run Pending Migrations
```bash
npm run migration:run
```
Executes all pending migrations in order. Safe to run multiple times.

### Revert Last Migration
```bash
npm run migration:revert
```
Undoes the most recently applied migration.

### Generate New Migration (Auto)
```bash
npm run migration:generate -- src/database/migrations/AddColumnName
```
Compares entities with database and generates migration automatically.

### Create Blank Migration
```bash
npm run migration:create -- src/database/migrations/CustomChanges
```
Creates an empty migration file for manual changes.

## Automatic Migration on Startup

The application is configured with `migrationsRun: true` in `database.module.ts`, which means:
- Migrations run automatically when the application starts
- The database schema is always up-to-date
- No manual migration step needed in Docker

## Development Workflow

### Making Schema Changes

1. **Modify Entity Files**
   ```typescript
   // Example: Add a new field to User entity
   @Column({ nullable: true })
   phoneNumber?: string;
   ```

2. **Generate Migration**
   ```bash
   npm run migration:generate -- src/database/migrations/AddUserPhoneNumber
   ```

3. **Review Generated Migration**
   - Check the `up()` and `down()` methods
   - Ensure data migrations are handled correctly
   - Test both directions

4. **Run Migration**
   ```bash
   npm run migration:run
   ```

5. **Test Rollback**
   ```bash
   npm run migration:revert
   npm run migration:run
   ```

### Creating Manual Migrations

For complex changes that can't be auto-generated:

1. **Create Blank Migration**
   ```bash
   npm run migration:create -- src/database/migrations/ComplexDataMigration
   ```

2. **Implement Up and Down**
   ```typescript
   public async up(queryRunner: QueryRunner): Promise<void> {
     // Your SQL or QueryRunner commands
     await queryRunner.query(`
       UPDATE tasks SET priority = 'HIGH' WHERE priority = 'URGENT'
     `);
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
     // Reverse the changes
     await queryRunner.query(`
       UPDATE tasks SET priority = 'URGENT' WHERE priority = 'HIGH'
     `);
   }
   ```

## Migration Best Practices

### DO:
✅ Test migrations on a copy of production data
✅ Keep migrations small and focused
✅ Use descriptive names
✅ Always implement both `up()` and `down()`
✅ Commit migrations with the code changes
✅ Run migrations in a transaction when possible

### DON'T:
❌ Modify existing migrations after they've been deployed
❌ Delete migrations that have been run
❌ Use `synchronize: true` in production
❌ Skip testing the `down()` method
❌ Make breaking changes without data migration

## Common Scenarios

### Adding a New Column
```typescript
await queryRunner.query(`
  ALTER TABLE "users"
  ADD COLUMN "phone_number" character varying(20)
`);
```

### Adding an Index
```typescript
await queryRunner.query(`
  CREATE INDEX "IDX_users_phone_number" ON "users" ("phone_number")
`);
```

### Adding a Foreign Key
```typescript
await queryRunner.query(`
  ALTER TABLE "tasks"
  ADD CONSTRAINT "FK_tasks_reviewer_id"
  FOREIGN KEY ("reviewer_id")
  REFERENCES "users"("id")
  ON DELETE SET NULL
`);
```

### Migrating Data
```typescript
// Add new column with default
await queryRunner.query(`
  ALTER TABLE "tasks"
  ADD COLUMN "estimated_hours" integer DEFAULT 0
`);

// Migrate existing data
await queryRunner.query(`
  UPDATE "tasks"
  SET "estimated_hours" = 8
  WHERE "priority" = 'HIGH'
`);

// Remove default after migration
await queryRunner.query(`
  ALTER TABLE "tasks"
  ALTER COLUMN "estimated_hours" DROP DEFAULT
`);
```

## Troubleshooting

### Error: "relation already exists"
**Cause**: Tables were created by `synchronize: true` before migrations.

**Solution**:
```bash
# Option 1: Drop and recreate database
psql -U postgres -c "DROP DATABASE task_schedule_manager;"
psql -U postgres -c "CREATE DATABASE task_schedule_manager;"
npm run migration:run

# Option 2: Drop tables manually
psql -U postgres -d task_schedule_manager -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migration:run
```

### Error: "column does not exist"
**Cause**: Migrations ran out of order or a migration was skipped.

**Solution**:
```bash
# Check migration status
npm run migration:show

# Revert to a known good state
npm run migration:revert  # Repeat as needed

# Run migrations again
npm run migration:run
```

### Error: "migration has already been run"
**Cause**: The migrations table shows this migration as completed.

**Solution**:
```bash
# Check what's been run
npm run migration:show

# If needed, manually remove from migrations table
psql -U postgres -d task_schedule_manager -c "DELETE FROM migrations WHERE name = 'MigrationName';"
```

### Need to Reset Everything
```bash
# Complete reset
psql -U postgres -c "DROP DATABASE task_schedule_manager;"
psql -U postgres -c "CREATE DATABASE task_schedule_manager;"
npm run migration:run
npm run seed  # If you have seed data
```

## Production Deployment

### Pre-Deployment Checklist
- [ ] All migrations tested locally
- [ ] Rollback tested for each migration
- [ ] Backup of production database created
- [ ] Migrations reviewed by team
- [ ] Downtime window scheduled (if needed)

### Deployment Steps
1. **Backup Database**
   ```bash
   pg_dump -U postgres task_schedule_manager > backup.sql
   ```

2. **Run Migrations**
   ```bash
   npm run migration:run
   ```

3. **Verify Success**
   ```bash
   npm run migration:show
   ```

4. **Deploy Application**
   - Deploy new code
   - Application will auto-run migrations on startup

### Rollback Plan
If something goes wrong:
```bash
# Revert migrations
npm run migration:revert

# Or restore from backup
psql -U postgres task_schedule_manager < backup.sql
```

## Docker Integration

The Docker setup automatically handles migrations:

```yaml
# docker-compose.yml
services:
  api:
    depends_on:
      - postgres
    # Migrations run automatically on startup due to migrationsRun: true
```

No manual migration step needed when using Docker Compose!

## Migration Table

TypeORM creates a `migrations` table to track which migrations have been run:

```sql
SELECT * FROM migrations;
```

Output:
```
id | timestamp     | name
---+---------------+---------------------------
1  | 1704067200000 | InitialSchema1704067200000
```

## Additional Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Database Migration Best Practices](https://www.prisma.io/dataguide/types/relational/migration-strategies)

## Support

For issues or questions about migrations:
1. Check this guide
2. Review the migration README in `src/database/migrations/`
3. Check TypeORM documentation
4. Review the migration files for examples
