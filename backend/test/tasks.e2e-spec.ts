import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let projectId: string;
  let taskId: string;

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
    const uniqueEmail = `tasks-test-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Tasks Test User',
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

    // Create a project for task testing
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Task Test Project',
        description: 'Project for testing tasks',
      });

    projectId = projectResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects/:projectId/tasks', () => {
    it('should create a task with valid data (201 Created)', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test task description',
          priority: 'HIGH',
          assigneeId: userId,
          scheduledStart: '2024-01-15T09:00:00.000Z',
          scheduledEnd: '2024-01-15T17:00:00.000Z',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.title).toBe('Test Task');
          expect(res.body.description).toBe('Test task description');
          expect(res.body.priority).toBe('HIGH');
          expect(res.body.status).toBe('TODO');
          expect(res.body.assigneeId).toBe(userId);
          expect(res.body.projectId).toBe(projectId);
          expect(res.body.scheduledStart).toBeDefined();
          expect(res.body.scheduledEnd).toBeDefined();
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();

          // Save task ID for later tests
          taskId = res.body.id;
        });
    });

    it('should create a task with MEDIUM priority', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Medium Priority Task',
          description: 'Task with medium priority',
          priority: 'MEDIUM',
          assigneeId: userId,
          scheduledStart: '2024-01-16T09:00:00.000Z',
          scheduledEnd: '2024-01-16T17:00:00.000Z',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.priority).toBe('MEDIUM');
          expect(res.body.status).toBe('TODO');
        });
    });

    it('should create a task with LOW priority', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Low Priority Task',
          description: 'Task with low priority',
          priority: 'LOW',
          assigneeId: userId,
          scheduledStart: '2024-01-17T09:00:00.000Z',
          scheduledEnd: '2024-01-17T17:00:00.000Z',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.priority).toBe('LOW');
        });
    });

    it('should return 400 for invalid date range (scheduledEnd before scheduledStart)', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Date Task',
          description: 'Task with invalid dates',
          priority: 'HIGH',
          assigneeId: userId,
          scheduledStart: '2024-01-15T17:00:00.000Z',
          scheduledEnd: '2024-01-15T09:00:00.000Z', // Before start
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return 400 for missing required title field', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Task without title',
          priority: 'HIGH',
          assigneeId: userId,
          scheduledStart: '2024-01-15T09:00:00.000Z',
          scheduledEnd: '2024-01-15T17:00:00.000Z',
        })
        .expect(400);
    });

    it('should return 400 for invalid priority value', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Priority Task',
          description: 'Task with invalid priority',
          priority: 'INVALID_PRIORITY',
          assigneeId: userId,
          scheduledStart: '2024-01-15T09:00:00.000Z',
          scheduledEnd: '2024-01-15T17:00:00.000Z',
        })
        .expect(400);
    });

    it('should return 404 for non-existent project', () => {
      const fakeProjectId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .post(`/projects/${fakeProjectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for Non-existent Project',
          description: 'This should fail',
          priority: 'HIGH',
          assigneeId: userId,
          scheduledStart: '2024-01-15T09:00:00.000Z',
          scheduledEnd: '2024-01-15T17:00:00.000Z',
        })
        .expect(404);
    });

    it('should return 404 for non-existent assignee', () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task with Invalid Assignee',
          description: 'This should fail',
          priority: 'HIGH',
          assigneeId: fakeUserId,
          scheduledStart: '2024-01-15T09:00:00.000Z',
          scheduledEnd: '2024-01-15T17:00:00.000Z',
        })
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .send({
          title: 'Unauthorized Task',
          description: 'This should fail',
          priority: 'HIGH',
          assigneeId: userId,
          scheduledStart: '2024-01-15T09:00:00.000Z',
          scheduledEnd: '2024-01-15T17:00:00.000Z',
        })
        .expect(401);
    });
  });

  describe('GET /projects/:projectId/tasks', () => {
    beforeAll(async () => {
      // Create multiple tasks for filtering and sorting tests
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task Alpha',
          description: 'First task',
          priority: 'HIGH',
          assigneeId: userId,
          scheduledStart: '2024-01-20T09:00:00.000Z',
          scheduledEnd: '2024-01-20T12:00:00.000Z',
        });

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task Beta',
          description: 'Second task',
          priority: 'MEDIUM',
          assigneeId: userId,
          scheduledStart: '2024-01-21T09:00:00.000Z',
          scheduledEnd: '2024-01-21T12:00:00.000Z',
        });

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task Gamma',
          description: 'Third task',
          priority: 'LOW',
          assigneeId: userId,
          scheduledStart: '2024-01-22T09:00:00.000Z',
          scheduledEnd: '2024-01-22T12:00:00.000Z',
        });
    });

    it('should return all tasks for a project (200 OK)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
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
          expect(task.assignee).toBeDefined();
          expect(task.project).toBeDefined();
        });
    });

    it('should filter tasks by status (200 OK)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks?status=TODO`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((task: any) => {
            expect(task.status).toBe('TODO');
          });
        });
    });

    it('should filter tasks by priority (200 OK)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks?priority=HIGH`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((task: any) => {
            expect(task.priority).toBe('HIGH');
          });
        });
    });

    it('should filter tasks by assignee (200 OK)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks?assigneeId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((task: any) => {
            expect(task.assigneeId).toBe(userId);
          });
        });
    });

    it('should sort tasks by scheduledStart ascending (200 OK)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks?sortBy=scheduledStart&sortOrder=ASC`)
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

    it('should sort tasks by scheduledStart descending (200 OK)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks?sortBy=scheduledStart&sortOrder=DESC`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 1) {
            for (let i = 0; i < res.body.length - 1; i++) {
              const date1 = new Date(res.body[i].scheduledStart);
              const date2 = new Date(res.body[i + 1].scheduledStart);
              expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
            }
          }
        });
    });

    it('should return 404 for non-existent project', () => {
      const fakeProjectId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/projects/${fakeProjectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .expect(401);
    });
  });

  describe('PATCH /tasks/:id', () => {
    let updateTaskId: string;

    beforeAll(async () => {
      // Create a task for update testing
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for Update Test',
          description: 'Original description',
          priority: 'MEDIUM',
          assigneeId: userId,
          scheduledStart: '2024-01-25T09:00:00.000Z',
          scheduledEnd: '2024-01-25T17:00:00.000Z',
        });

      updateTaskId = response.body.id;
    });

    it('should update task with valid data (200 OK)', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${updateTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task Title',
          description: 'Updated description',
          status: 'IN_PROGRESS',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(updateTaskId);
          expect(res.body.title).toBe('Updated Task Title');
          expect(res.body.description).toBe('Updated description');
          expect(res.body.status).toBe('IN_PROGRESS');
        });
    });

    it('should update only provided fields (partial update)', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${updateTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'HIGH',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.priority).toBe('HIGH');
          // Title should remain from previous update
          expect(res.body.title).toBe('Updated Task Title');
        });
    });

    it('should update task status to DONE', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${updateTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'DONE',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('DONE');
        });
    });

    it('should update scheduled dates', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${updateTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scheduledStart: '2024-01-26T10:00:00.000Z',
          scheduledEnd: '2024-01-26T18:00:00.000Z',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.scheduledStart).toBeDefined();
          expect(res.body.scheduledEnd).toBeDefined();
        });
    });

    it('should return 400 for invalid date range', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${updateTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scheduledStart: '2024-01-26T18:00:00.000Z',
          scheduledEnd: '2024-01-26T10:00:00.000Z', // Before start
        })
        .expect(400);
    });

    it('should return 404 for non-existent task', () => {
      const fakeTaskId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .patch(`/tasks/${fakeTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Update Non-existent',
        })
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${updateTaskId}`)
        .send({
          title: 'Unauthorized Update',
        })
        .expect(401);
    });
  });

  describe('DELETE /tasks/:id', () => {
    let deleteTaskId: string;

    beforeAll(async () => {
      // Create a task to delete
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task to Delete',
          description: 'This task will be deleted',
          priority: 'LOW',
          assigneeId: userId,
          scheduledStart: '2024-01-27T09:00:00.000Z',
          scheduledEnd: '2024-01-27T17:00:00.000Z',
        });

      deleteTaskId = response.body.id;
    });

    it('should delete task (204 No Content)', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${deleteTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify task is deleted by trying to fetch it
      await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const deletedTask = res.body.find((t: any) => t.id === deleteTaskId);
          expect(deletedTask).toBeUndefined();
        });
    });

    it('should return 404 for non-existent task', () => {
      const fakeTaskId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .delete(`/tasks/${fakeTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${deleteTaskId}`)
        .expect(401);
    });
  });
});
