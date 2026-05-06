import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false, // Use migrations instead of synchronize
        migrationsRun: true, // Automatically run migrations on startup
        logging: configService.get<string>('NODE_ENV') === 'development',
        // Connection pooling configuration
        extra: {
          max: 10, // Maximum number of connections in the pool
          min: 2, // Minimum number of connections in the pool
          idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
          connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
        },
        // Retry connection on failure
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
