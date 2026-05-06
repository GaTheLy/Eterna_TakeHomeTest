import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('DatabaseModule Configuration', () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should load database host from environment', () => {
    const dbHost = configService.get<string>('DB_HOST');
    expect(dbHost).toBeDefined();
    expect(typeof dbHost).toBe('string');
  });

  it('should load database port from environment', () => {
    const dbPort = configService.get<number>('DB_PORT');
    expect(dbPort).toBeDefined();
    // Environment variables are loaded as strings, TypeORM will convert them
    expect(Number(dbPort)).toBe(5432);
  });

  it('should load database username from environment', () => {
    const dbUsername = configService.get<string>('DB_USERNAME');
    expect(dbUsername).toBeDefined();
    expect(typeof dbUsername).toBe('string');
  });

  it('should load database password from environment', () => {
    const dbPassword = configService.get<string>('DB_PASSWORD');
    expect(dbPassword).toBeDefined();
    expect(typeof dbPassword).toBe('string');
  });

  it('should load database name from environment', () => {
    const dbDatabase = configService.get<string>('DB_DATABASE');
    expect(dbDatabase).toBeDefined();
    expect(dbDatabase).toBe('task_schedule_manager');
  });

  it('should have NODE_ENV configured', () => {
    const nodeEnv = configService.get<string>('NODE_ENV');
    expect(nodeEnv).toBeDefined();
    expect(['development', 'production', 'test']).toContain(nodeEnv);
  });
});
