# Quick Start: Database Seeder

## Prerequisites

1. PostgreSQL database is running
2. Environment variables are configured in `.env`
3. Database migrations have been executed

## Run the Seeder

```bash
cd backend
npm run seed
```

## Expected Output

```
🌱 Starting database seeding...
✅ Database connection established
🧹 Clearing existing data...
✅ Existing data cleared
👤 Creating users...
✅ Created 2 users: admin@example.com, member@example.com
📁 Creating projects...
✅ Created 3 projects: Website Redesign, Mobile App Development, Legacy System Migration
📋 Creating tasks...
✅ Created 13 tasks with varied priorities, statuses, and schedules
   - Including 2 overlapping task pairs for conflict testing

📊 Seeding Summary:
   Users: 2
   Projects: 3
   Tasks: 13

🎉 Database seeding completed successfully!

📝 Test Credentials:
   Admin: admin@example.com / password123
   Member: member@example.com / password123
```

## Test the Seeded Data

### 1. Login as Admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### 2. Get Projects

```bash
curl http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Check Schedule Conflicts

```bash
curl http://localhost:3000/schedule/conflicts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Error: Connection Refused

**Problem**: Database is not running

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Start PostgreSQL (Docker)
docker-compose up -d postgres
```

### Error: Relation Does Not Exist

**Problem**: Migrations haven't been run

**Solution**:
```bash
npm run migration:run
```

### Error: Password Authentication Failed

**Problem**: Database credentials in `.env` are incorrect

**Solution**: Check and update these variables in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=task_schedule_manager
```

## What Gets Created

| Resource | Count | Details |
|----------|-------|---------|
| Users | 2 | Admin (admin@example.com) and Member (member@example.com) |
| Projects | 3 | 2 ACTIVE, 1 ARCHIVED |
| Tasks | 13 | Varied priorities (LOW, MEDIUM, HIGH, URGENT) |
| Conflicts | 2 pairs | Overlapping tasks for testing |

## Next Steps

1. ✅ Run the seeder
2. ✅ Login with test credentials
3. ✅ Test API endpoints
4. ✅ Verify conflict detection
5. ✅ Start building features

## Need More Details?

See `README.md` in this directory for comprehensive documentation.
