# Database Seeder

This directory contains database seeding scripts for populating the database with sample data for testing and development.

## Overview

The seeder script (`seed.ts`) creates a complete set of sample data that demonstrates all features of the Task & Schedule Manager system.

## What Gets Seeded

### Users (2)
- **Admin User**
  - Email: `admin@example.com`
  - Password: `password123`
  - Role: ADMIN
  
- **Member User**
  - Email: `member@example.com`
  - Password: `password123`
  - Role: MEMBER

### Projects (3)
1. **Website Redesign** (ACTIVE, owned by Admin)
   - Complete overhaul of company website with modern design
   
2. **Mobile App Development** (ACTIVE, owned by Member)
   - Native mobile application for iOS and Android
   
3. **Legacy System Migration** (ARCHIVED, owned by Admin)
   - Migration of legacy monolith to microservices

### Tasks (13)
The seeder creates 13 tasks with:
- **Varied priorities**: LOW, MEDIUM, HIGH, URGENT
- **Varied statuses**: TODO, IN_PROGRESS, DONE
- **Varied schedules**: Past, present, and future dates
- **Multiple assignees**: Tasks assigned to both users
- **Scheduling conflicts**: At least 2 pairs of overlapping tasks for testing conflict detection

#### Conflict Examples
1. **Member User Conflict**: "Optimize images and assets" overlaps with "Code review session" on the same day
2. **Admin User Conflict**: "Design app icon and splash screen" overlaps with "Team standup meeting"

## Usage

### Run the Seeder

```bash
# From the backend directory
npm run seed
```

### Prerequisites

1. Database must be running (PostgreSQL)
2. Migrations must be executed first:
   ```bash
   npm run migration:run
   ```
3. Environment variables must be configured (`.env` file)

### What Happens

1. **Clears existing data** - Removes all tasks, projects, and users (in that order)
2. **Creates users** - Inserts 2 users with hashed passwords
3. **Creates projects** - Inserts 3 projects with different statuses
4. **Creates tasks** - Inserts 13 tasks with varied attributes
5. **Displays summary** - Shows counts and test credentials

### Expected Output

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

✅ Seeder script finished
```

## Testing the Seeded Data

### Login as Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Login as Member
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@example.com","password":"password123"}'
```

### View Projects
```bash
curl http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### View Schedule Conflicts
```bash
curl http://localhost:3000/schedule/conflicts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Customization

To modify the seed data:

1. Edit `seed.ts`
2. Adjust user credentials, project details, or task schedules
3. Run `npm run seed` to apply changes

## Troubleshooting

### Error: "relation does not exist"
- **Cause**: Migrations haven't been run
- **Solution**: Run `npm run migration:run` first

### Error: "password authentication failed"
- **Cause**: Database credentials in `.env` are incorrect
- **Solution**: Check `DB_USERNAME` and `DB_PASSWORD` in `.env`

### Error: "database does not exist"
- **Cause**: Database hasn't been created
- **Solution**: Create the database manually or check `DB_DATABASE` in `.env`

## Notes

- The seeder uses **bcrypt** to hash passwords (same as the auth system)
- All timestamps are calculated relative to the current date
- The seeder is **idempotent** - it clears existing data before seeding
- Conflicts are intentionally created for testing the conflict detection feature
