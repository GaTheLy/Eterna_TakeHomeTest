import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Schedule (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let projectId: string;

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

    // Register and login to get auth token
    const uniqueEmail = `schedule-test-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Schedule Test User',
        email: uniqueEmail,
        password: 'password123',
      });

    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;

    // Create a project for schedule testing
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Schedule Test Project',
        description: 'Project for testing schedule',
      });

    projectId = projectResponse.body.id;

    // Create tasks for schedule testing
    await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Task 1',
        description: 'First task',
        priority: 'HIGH',
        assigneeId: userId,
        scheduledStart: '2024-01-15T09:00:00.000Z',
        scheduledEnd: '2024-01-15T12:00:00.000Z',
      });

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Task 2',
        description: 'Second task',
        priority: 'MEDIUM',
        assigneeId: userId,
        scheduledStart: '2024-01-15T14:00:00.000Z',
        scheduledEnd: '2024-01-15T17:00:00.000Z',
      });

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Task 3',
        description: 'Third task',
        priority: 'LOW',
        assigneeId: userId,
        scheduledStart: '2024-01-16T09:00:00.000Z',
        scheduledEnd: '2024-01-16T12:00:00.000Z',
      });

    // Create overlapping tasks for conflict testing
    await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Overlapping Task 1',
        description: 'First overlapping task',
        priority: 'HIGH',
        assigneeId: userId,
        scheduledStart: '2024-01-20T09:00:00.000Z',
        scheduledEnd: '2024-01-20T12:00:00.000Z',
      });

    await request(app.getHttpServer())
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Overlapping Task 2',
        description: 'Second overlapping task',
        priority: 'HIGH',
        assigneeId: userId,
        scheduledStart: '2024-01-20T11:00:00.000Z',
        scheduledEnd: '2024-01-20T14:00:00.000Z',
      });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /schedule', () => {
    it('should return tasks within date range (200 OK)', () => {
      return request(app.getHttpServer())
        .get('/schedule?start=2024-01-15T00:00:00.000Z&end=2024-01-15T23:59:59.999Z')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          
          // Verify all tasks are within the date range
          res.body.forEach((task: any) => {
            const taskStart = new Date(task.scheduledStart);
            const taskEnd = new Date(task.scheduledEnd);
            const rangeStart = new Date('2024-01-15T00:00:00.000Z');
            const rangeEnd = new Date('2024-01-15T23:59:59.999Z');
            
            // Task overlaps with range if task.start <= range.end AND task.end >= range.start
            expect(taskStart.getTime()).toBeLessThanOrEqual(rangeEnd.getTime());
            expect(taskEnd.getTime()).toBeGreaterThanOrEqual(rangeStart.getTime());
          });
        });
    });

    it('should return tasks with project and assignee information', () => {
      return request(app.getHttpServer())
        .get('/schedule?start=2024-01-15T00:00:00.000Z&end=2024-01-16T23:59:59.999Z')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          
          const task = res.body[0];
          expect(task.id).toBeDefined();
          expect(task.title).toBeDefined();
          expect(task.priority).toBeDefined();
          expect(task.status).toBeDefined();
          expect(task.scheduledStart).toBeDefined();
          expect(task.scheduledEnd).toBeDefined();
          expect(task.project).toBeDefined();
          expect(task.project.id).toBeDefined();
          expect(task.project.name).toBeDefined();
          expect(task.assignee).toBeDefined();
          expect(task.assignee.id).toBeDefined();
          expect(task.assignee.name).toBeDefined();
        });
    });

    it('should return empty array when no tasks in range', () => {
      return request(app.getHttpServer())
        .get('/schedule?start=2025-01-01T00:00:00.000Z&end=2025-01-31T23:59:59.999Z')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });

    it('should return tasks sorted by scheduledStart ascending', () => {
      return request(app.getHttpServer())
        .get('/schedule?start=2024-01-15T00:00:00.000Z&end=2024-01-16T23:59:59.999Z')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          if (res.body.length > 1) {
            for (let i = 0; i < res.body.length - 1; i++) {
              const date1 = new Date(res.body[i].scheduledStart);
              const date2 = new Date(res.body[i + 1].scheduledStart);
              expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
            }
          }
        });
    });

    it('should return 400 for missing start parameter', () => {
      return request(app.getHttpServer())
        .get('/schedule?end=2024-01-15T23:59:59.999Z')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return 400 for missing end parameter', () => {
      return request(app.getHttpServer())
        .get('/schedule?start=2024-01-15T00:00:00.000Z')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return 400 for invalid date range (end before start)', () => {
      return request(app.getHttpServer())
        .get('/schedule?start=2024-01-15T23:59:59.999Z&end=2024-01-15T00:00:00.000Z')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return 400 for invalid date format', () => {
      return request(app.getHttpServer())
        .get('/schedule?start=invalid-date&end=2024-01-15T23:59:59.999Z')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/schedule?start=2024-01-15T00:00:00.000Z&end=2024-01-15T23:59:59.999Z')
        .expect(401);
    });
  });

  describe('GET /schedule/conflicts', () => {
    it('should return conflicts grouped by assignee (200 OK)', () => {
      return request(app.getHttpServer())
        .get('/schedule/conflicts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          if (res.body.length > 0) {
            const conflict = res.body[0];
            expect(conflict.assignee).toBeDefined();
            expect(conflict.assignee.id).toBeDefined();
            expect(conflict.assignee.name).toBeDefined();
            expect(conflict.assignee.email).toBeDefined();
            expect(conflict.conflictingTasks).toBeDefined();
            expect(Array.isArray(conflict.conflictingTasks)).toBe(true);
            expect(conflict.conflictingTasks.length).toBeGreaterThanOrEqual(2);
            
            // Verify conflicting tasks have required fields
            const task = conflict.conflictingTasks[0];
            expect(task.id).toBeDefined();
            expect(task.title).toBeDefined();
            expect(task.projectName).toBeDefined();
            expect(task.scheduledStart).toBeDefined();
            expect(task.scheduledEnd).toBeDefined();
          }
        });
    });

    it('should detect overlapping tasks for same assignee', () => {
      return request(app.getHttpServer())
        .get('/schedule/conflicts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          // Find conflicts for our test user
          const userConflict = res.body.find((c: any) => c.assignee.id === userId);
          
          if (userConflict) {
            expect(userConflict.conflictingTasks.length).toBeGreaterThanOrEqual(2);
            
            // Verify tasks actually overlap
            const tasks = userConflict.conflictingTasks;
            let foundOverlap = false;
            
            for (let i = 0; i < tasks.length; i++) {
              for (let j = i + 1; j < tasks.length; j++) {
                const t1Start = new Date(tasks[i].scheduledStart);
                const t1End = new Date(tasks[i].scheduledEnd);
                const t2Start = new Date(tasks[j].scheduledStart);
                const t2End = new Date(tasks[j].scheduledEnd);
                
                // Check if tasks overlap
                if (t1Start < t2End && t2Start < t1End) {
                  foundOverlap = true;
                  break;
                }
              }
              if (foundOverlap) break;
            }
            
            expect(foundOverlap).toBe(true);
          }
        });
    });

    it('should return conflicting tasks sorted by scheduledStart', () => {
      return request(app.getHttpServer())
        .get('/schedule/conflicts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          if (res.body.length > 0) {
            const conflict = res.body[0];
            const tasks = conflict.conflictingTasks;
            
            if (tasks.length > 1) {
              for (let i = 0; i < tasks.length - 1; i++) {
                const date1 = new Date(tasks[i].scheduledStart);
                const date2 = new Date(tasks[i + 1].scheduledStart);
                expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
              }
            }
          }
        });
    });

    it('should return empty array when no conflicts exist', async () => {
      // Create a new user with no overlapping tasks
      const uniqueEmail = `no-conflicts-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'No Conflicts User',
          email: uniqueEmail,
          password: 'password123',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: 'password123',
        });

      const noConflictToken = loginResponse.body.access_token;
      const noConflictUserId = loginResponse.body.user.id;

      // Create a project for this user
      const projectResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${noConflictToken}`)
        .send({
          name: 'No Conflict Project',
          description: 'Project with no conflicts',
        });

      const noConflictProjectId = projectResponse.body.id;

      // Create non-overlapping tasks
      await request(app.getHttpServer())
        .post(`/projects/${noConflictProjectId}/tasks`)
        .set('Authorization', `Bearer ${noConflictToken}`)
        .send({
          title: 'Non-overlapping Task 1',
          description: 'First task',
          priority: 'HIGH',
          assigneeId: noConflictUserId,
          scheduledStart: '2024-02-01T09:00:00.000Z',
          scheduledEnd: '2024-02-01T12:00:00.000Z',
        });

      await request(app.getHttpServer())
        .post(`/projects/${noConflictProjectId}/tasks`)
        .set('Authorization', `Bearer ${noConflictToken}`)
        .send({
          title: 'Non-overlapping Task 2',
          description: 'Second task',
          priority: 'HIGH',
          assigneeId: noConflictUserId,
          scheduledStart: '2024-02-01T13:00:00.000Z',
          scheduledEnd: '2024-02-01T16:00:00.000Z',
        });

      // Check conflicts for this user
      return request(app.getHttpServer())
        .get('/schedule/conflicts')
        .set('Authorization', `Bearer ${noConflictToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          // Should not have conflicts for this user
          const userConflict = res.body.find((c: any) => c.assignee.id === noConflictUserId);
          expect(userConflict).toBeUndefined();
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/schedule/conflicts')
        .expect(401);
    });
  });
});
