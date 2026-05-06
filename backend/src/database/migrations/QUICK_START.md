# Migration Quick Start Guide

## First Time Setup

### 1. Ensure Database is Running
```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres

# Or start PostgreSQL locally
# Make sure PostgreSQL is running on port 5432
```

### 2. Configure Environment Variables
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_DATABASE=task_schedule_manager
```

### 3. Run Initial Migration
```bash
# This will create all tables, indexes, and constraints
npm run migration:run
```

### 4. Verify Migration Success
```bash
# Check migration status
npm run migration:show

# Expected output:
# [X] InitialSchema1704067200000
```

## Daily Development

### Check What's Been Applied
```bash
npm run migration:show
```

### Apply New Migrations
```bash
npm run migration:run
```

### Undo Last Migration
```bash
npm run migration:revert
```

## Creating New Migrations

### Auto-Generate from Entity Changes
```bash
# 1. Modify your entity files (e.g., add a new column)
# 2. Generate migration
npm run migration:generate -- src/database/migrations/DescriptiveName

# 3. Review the generated file
# 4. Run the migration
npm run migration:run
```

### Create Manual Migration
```bash
# 1. Create blank migration
npm run migration:create -- src/database/migrations/CustomChanges

# 2. Edit the file and add your SQL
# 3. Run the migration
npm run migration:run
```

## Common Issues

### "relation already exists"
The database already has tables. Either:
```bash
# Option A: Drop and recreate
psql -U postgres -c "DROP DATABASE task_schedule_manager;"
psql -U postgres -c "CREATE DATABASE task_schedule_manager;"
npm run migration:run

# Option B: Use synchronize (development only)
# Set synchronize: true in database.module.ts temporarily
```

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker-compose ps

# Or check local PostgreSQL
psql -U postgres -c "SELECT version();"

# Start database if needed
docker-compose up -d postgres
```

### "Migration has already been run"
```bash
# Check status
npm run migration:show

# If you need to re-run, manually delete from migrations table
psql -U postgres -d task_schedule_manager -c "DELETE FROM migrations WHERE name = 'MigrationName';"
```

## What the Initial Migration Creates

### Tables
- ✅ `users` - User accounts with authentication
- ✅ `projects` - Project containers
- ✅ `tasks` - Work items with scheduling

### Indexes (13 total)
- ✅ Email lookup (unique + performance)
- ✅ Project filtering (owner, status, name)
- ✅ Task filtering (status, priority, assignee)
- ✅ Schedule queries (start/end dates)
- ✅ Composite indexes for complex queries

### Constraints
- ✅ Unique email addresses
- ✅ Foreign key relationships
- ✅ Check constraint: `scheduled_end > scheduled_start`
- ✅ Enum constraints for valid values

## Automatic Migration on Startup

The application is configured to run migrations automatically when it starts:

```typescript
// database.module.ts
migrationsRun: true  // ← Runs migrations on startup
```

This means:
- ✅ No manual migration step in Docker
- ✅ Database always up-to-date
- ✅ Safe to restart application

## Testing Migrations

### Test Up Migration
```bash
npm run migration:run
```

### Test Down Migration
```bash
npm run migration:revert
```

### Test Full Cycle
```bash
npm run migration:run
npm run migration:revert
npm run migration:run
```

## Production Deployment

### Before Deploying
1. ✅ Test migrations locally
2. ✅ Test rollback
3. ✅ Backup production database
4. ✅ Review migration SQL

### Deploy Process
1. Backup database
2. Run migrations: `npm run migration:run`
3. Verify: `npm run migration:show`
4. Deploy application

### If Something Goes Wrong
```bash
# Revert migration
npm run migration:revert

# Or restore from backup
psql -U postgres task_schedule_manager < backup.sql
```

## Need More Help?

- 📖 See `MIGRATION_GUIDE.md` for detailed documentation
- 📖 See `SCHEMA.md` for database schema details
- 📖 See `README.md` in this directory for migration overview
- 🔗 [TypeORM Migrations Docs](https://typeorm.io/migrations)
