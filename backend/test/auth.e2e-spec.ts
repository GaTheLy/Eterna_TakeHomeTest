import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable global validation pipe (same as in main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Test User');
          expect(res.body.email).toBe(uniqueEmail);
          expect(res.body.role).toBe('MEMBER');
          expect(res.body.password).toBeDefined(); // Password is hashed
          expect(res.body.createdAt).toBeDefined();
        });
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email');
        });
    });

    it('should return 400 for password less than 8 characters', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('password');
        });
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      const uniqueEmail = `duplicate-${Date.now()}@example.com`;

      // Register first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'First User',
          email: uniqueEmail,
          password: 'password123',
        })
        .expect(201);

      // Try to register with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Second User',
          email: uniqueEmail,
          password: 'password456',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });
  });

  describe('POST /auth/login', () => {
    const testEmail = `login-test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    beforeAll(async () => {
      // Register a test user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Login Test User',
          email: testEmail,
          password: testPassword,
        })
        .expect(201);
    });

    it('should login with valid credentials and return JWT token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(typeof res.body.access_token).toBe('string');
          expect(res.body.user).toBeDefined();
          expect(res.body.user.id).toBeDefined();
          expect(res.body.user.name).toBe('Login Test User');
          expect(res.body.user.email).toBe(testEmail);
          expect(res.body.user.role).toBe('MEMBER');
        });
    });

    it('should return 401 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 400 for missing credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
        })
        .expect(400);
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: testPassword,
        })
        .expect(400);
    });
  });

  describe('JWT Token Validation', () => {
    let authToken: string;
    const testEmail = `jwt-test-${Date.now()}@example.com`;

    beforeAll(async () => {
      // Register and login to get a valid token
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'JWT Test User',
          email: testEmail,
          password: 'password123',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
    });

    it('should have a valid JWT token structure', () => {
      expect(authToken).toBeDefined();
      const parts = authToken.split('.');
      expect(parts.length).toBe(3); // JWT has 3 parts: header.payload.signature
    });

    it('JWT token should contain user id and role in payload', () => {
      const payload = JSON.parse(
        Buffer.from(authToken.split('.')[1], 'base64').toString(),
      );
      expect(payload.sub).toBeDefined(); // User ID
      expect(payload.role).toBeDefined(); // User role
      expect(payload.role).toBe('MEMBER');
      expect(payload.exp).toBeDefined(); // Expiration time
    });

    it('JWT token should have expiration time set (24 hours by default)', () => {
      const payload = JSON.parse(
        Buffer.from(authToken.split('.')[1], 'base64').toString(),
      );
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;
      
      // Should expire in approximately 24 hours (86400 seconds)
      // Allow some tolerance for test execution time
      expect(expiresIn).toBeGreaterThan(86300); // ~23.9 hours
      expect(expiresIn).toBeLessThan(86500); // ~24.1 hours
    });

    it('should reject requests without JWT token (401)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .expect(401);
    });

    it('should reject requests with invalid JWT token (401)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should reject requests with malformed Authorization header (401)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('should accept requests with valid JWT token', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          // Should not return 401 - either 200 with data or other valid response
          expect(res.status).not.toBe(401);
        });
    });
  });
});
