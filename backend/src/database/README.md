# Database Module

This module configures the PostgreSQL database connection using TypeORM for the Task & Schedule Manager application.

## Configuration

The database connection is configured using environment variables from the `.env` file:

### Environment Variables

- `DB_HOST`: PostgreSQL server hostname (default: `localhost`)
- `DB_PORT`: PostgreSQL server port (default: `5432`)
- `DB_USERNAME`: Database username (default: `postgres`)
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name (default: `task_schedule_manager`)
- `NODE_ENV`: Application environment (`development`, `production`, or `test`)

### Connection Pooling

The database module is configured with connection pooling for optimal performance:

- **Maximum connections**: 10
- **Minimum connections**: 2
- **Idle timeout**: 30 seconds (closes idle connections)
- **Connection timeout**: 2 seconds (returns error if connection cannot be established)

### Retry Configuration

The module automatically retries failed connections:

- **Retry attempts**: 3
- **Retry delay**: 3 seconds between attempts

### Development Features

When `NODE_ENV=development`:

- **Auto-synchronize**: Automatically syncs database schema with entities (⚠️ disabled in production)
- **Query logging**: Logs all SQL queries to console for debugging

## Usage

The `DatabaseModule` is imported into the root `AppModule` and provides TypeORM functionality throughout the application.

### Importing Entities

To use entities in other modules:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### Using Repositories

Inject repositories into services:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
```

## Migrations

Database migrations are stored in `src/database/migrations/` and should be used for schema changes in production.

To generate a migration:

```bash
npm run typeorm migration:generate -- -n MigrationName
```

To run migrations:

```bash
npm run typeorm migration:run
```

## Seed Data

Seed scripts are stored in `src/database/seeds/` and are used to populate the database with initial test data for development and testing purposes.

### Running the Seeder

To populate the database with sample data:

```bash
npm run seed
```

### What Gets Seeded

The seeder creates a complete dataset for testing:

- **2 Users**: Admin and Member with test credentials
- **3 Projects**: With varied statuses (ACTIVE, ARCHIVED) and different owners
- **13 Tasks**: With varied priorities, statuses, schedules, and assignees
- **Scheduling Conflicts**: At least 2 pairs of overlapping tasks for testing conflict detection

### Test Credentials

After running the seeder, you can login with:

- **Admin**: `admin@example.com` / `password123`
- **Member**: `member@example.com` / `password123`

### Important Notes

- The seeder **clears all existing data** before inserting new data
- Run migrations before running the seeder: `npm run migration:run`
- The seeder is idempotent - safe to run multiple times
- See `src/database/seeds/README.md` for detailed documentation

## Security Notes

- Never commit the `.env` file with real credentials
- Use strong passwords in production
- Disable `synchronize` in production (use migrations instead)
- Implement proper database user permissions
- Use SSL/TLS for database connections in production

## Troubleshooting

### Connection Refused

If you see "Unable to connect to the database" errors:

1. Ensure PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env` file
3. Check PostgreSQL is listening on the correct port
4. Verify firewall rules allow connections

### Schema Sync Issues

If entities don't match the database schema:

1. In development: Set `synchronize: true` (already configured)
2. In production: Create and run migrations
3. Check entity decorators match database column types

### Performance Issues

If experiencing slow queries:

1. Check query logging to identify slow queries
2. Add appropriate indexes to entities
3. Adjust connection pool settings
4. Use query optimization techniques (select specific fields, use joins efficiently)
