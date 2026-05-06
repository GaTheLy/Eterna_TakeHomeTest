# Docker Compose Setup Guide

This guide explains how to run the Task & Schedule Manager application using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- At least 4GB of available RAM
- Ports 3000, 3001, and 5432 available

## Quick Start

### 1. Start All Services

```bash
# Build and start all services (database, backend, frontend)
docker-compose up --build
```

This command will:
- ✅ Build the backend Docker image
- ✅ Build the frontend Docker image
- ✅ Pull PostgreSQL 15 image
- ✅ Create a Docker network
- ✅ Start PostgreSQL database
- ✅ Wait for database to be healthy
- ✅ Run database migrations automatically
- ✅ Seed the database with sample data
- ✅ Start the backend API server
- ✅ Start the frontend dashboard

### 2. Access the Application

Once all services are running:

- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation (Swagger)**: http://localhost:3000/api/docs
- **PostgreSQL Database**: localhost:5432

### 3. Stop All Services

```bash
# Stop services (keeps data)
docker-compose down

# Stop services and remove volumes (deletes all data)
docker-compose down -v
```

## Detailed Commands

### Build Services

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build api
docker-compose build dashboard
```

### Start Services

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Start specific service
docker-compose up postgres
docker-compose up api
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs (live updates)
docker-compose logs -f

# View logs for specific service
docker-compose logs api
docker-compose logs postgres
docker-compose logs dashboard

# View last 100 lines
docker-compose logs --tail=100
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart dashboard
```

### Execute Commands in Containers

```bash
# Access backend container shell
docker-compose exec api sh

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d task_schedule_manager

# Run migrations manually
docker-compose exec api npm run migration:run

# Run seeds manually
docker-compose exec api npm run seed
```

## Service Details

### PostgreSQL Database

- **Image**: postgres:15-alpine
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres
- **Database**: task_schedule_manager
- **Data Volume**: postgres_data (persists data)

### Backend API

- **Port**: 3000
- **Technology**: NestJS + TypeORM
- **Auto-runs**: Migrations and seeds on startup
- **Health Check**: Checks if server responds on port 3000

### Frontend Dashboard

- **Port**: 3001 (mapped to container port 80)
- **Technology**: React + Vite + Tailwind CSS
- **Server**: Nginx
- **API Connection**: Connects to backend at http://localhost:3000

## Environment Variables

Environment variables are configured in `docker-compose.yml`. To customize:

1. Create a `.env` file in the project root
2. Override variables as needed:

```env
# Example .env file
DB_PASSWORD=your_secure_password
JWT_SECRET=your_secret_key
PORT=3000
```

## Troubleshooting

### Port Already in Use

If you get "port already allocated" error:

```bash
# Check what's using the port
lsof -i :3000  # Backend
lsof -i :3001  # Frontend
lsof -i :5432  # PostgreSQL

# Stop the conflicting service or change ports in docker-compose.yml
```

### Database Connection Failed

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Backend Won't Start

```bash
# Check backend logs
docker-compose logs api

# Rebuild backend
docker-compose build api
docker-compose up api

# Check if migrations ran
docker-compose exec api npm run migration:show
```

### Frontend Shows API Error

```bash
# Ensure backend is running
docker-compose ps api

# Check backend health
curl http://localhost:3000

# Check frontend environment
docker-compose exec dashboard env | grep VITE
```

### Clean Start (Reset Everything)

```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild and start fresh
docker-compose up --build
```

## Data Persistence

### Database Data

Database data is stored in a Docker volume named `postgres_data`. This means:
- ✅ Data persists when you stop/restart containers
- ✅ Data persists when you rebuild images
- ❌ Data is deleted when you run `docker-compose down -v`

### Backup Database

```bash
# Backup database to file
docker-compose exec postgres pg_dump -U postgres task_schedule_manager > backup.sql

# Restore database from file
docker-compose exec -T postgres psql -U postgres task_schedule_manager < backup.sql
```

## Development Workflow

### Making Code Changes

#### Backend Changes

```bash
# 1. Make changes to backend code
# 2. Rebuild and restart backend
docker-compose build api
docker-compose up -d api

# Or rebuild and restart in one command
docker-compose up -d --build api
```

#### Frontend Changes

```bash
# 1. Make changes to frontend code
# 2. Rebuild and restart frontend
docker-compose build dashboard
docker-compose up -d dashboard

# Or rebuild and restart in one command
docker-compose up -d --build dashboard
```

### Running Tests

```bash
# Backend unit tests (requires rebuilding with test dependencies)
docker-compose exec api npm test

# Backend E2E tests (requires test database)
docker-compose exec api npm run test:e2e
```

## Production Deployment

For production deployment:

1. **Change sensitive values**:
   - Set strong `DB_PASSWORD`
   - Set secure `JWT_SECRET`
   - Set `NODE_ENV=production`

2. **Use environment-specific compose file**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Enable HTTPS**:
   - Add reverse proxy (nginx/traefik)
   - Configure SSL certificates
   - Update CORS settings

4. **Set up monitoring**:
   - Add health check endpoints
   - Configure logging
   - Set up alerts

## Sample Data

The application automatically seeds the database with sample data:

### Users
- **Admin**: admin@example.com / password123
- **Member**: member@example.com / password123

### Projects
- 3 sample projects with various statuses

### Tasks
- 10+ sample tasks with different priorities and schedules
- Includes overlapping tasks for conflict testing

## Network Architecture

```
┌─────────────────────────────────────────────────┐
│                  Docker Network                  │
│                  (app-network)                   │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐│
│  │  PostgreSQL  │  │  Backend API │  │Frontend││
│  │              │  │              │  │        ││
│  │  Port: 5432  │◄─┤  Port: 3000  │◄─┤Port:80 ││
│  │              │  │              │  │        ││
│  └──────────────┘  └──────────────┘  └────────┘│
│         │                  │              │     │
└─────────┼──────────────────┼──────────────┼─────┘
          │                  │              │
          │                  │              │
    localhost:5432     localhost:3000  localhost:3001
```

## Health Checks

All services have health checks configured:

- **PostgreSQL**: Checks if database accepts connections
- **Backend**: Checks if HTTP server responds
- **Frontend**: Nginx is always healthy if running

View health status:
```bash
docker-compose ps
```

## Resource Usage

Typical resource usage:
- **PostgreSQL**: ~50MB RAM
- **Backend**: ~150MB RAM
- **Frontend**: ~20MB RAM
- **Total**: ~220MB RAM

## Next Steps

After starting the application:

1. ✅ Access frontend at http://localhost:3001
2. ✅ Register a new user or login with sample credentials
3. ✅ Explore the API documentation at http://localhost:3000/api/docs
4. ✅ Create projects and tasks
5. ✅ Test the schedule and conflict detection features

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Review this documentation
3. Check the main README.md
4. Verify Docker Desktop is running
5. Ensure ports are not in use
