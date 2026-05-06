import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Projects (e2e)', () => {
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
    const uniqueEmail = `projects-test-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Projects Test User',
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects', () => {
    it('should create a new project with valid data (201 Created)', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
          description: 'Test project description',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Test Project');
          expect(res.body.description).toBe('Test project description');
          expect(res.body.status).toBe('ACTIVE');
          expect(res.body.ownerId).toBe(userId);
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
          
          // Save project ID for later tests
          projectId = res.body.id;
        });
    });

    it('should create a project without description (optional field)', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project Without Description',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Project Without Description');
          expect(res.body.status).toBe('ACTIVE');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .send({
          name: 'Unauthorized Project',
          description: 'This should fail',
        })
        .expect(401);
    });

    it('should return 400 for empty project name', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
          description: 'Test description',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return 400 for missing required name field', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test description',
        })
        .expect(400);
    });

    it('should return 400 for name exceeding max length', () => {
      const longName = 'a'.repeat(256); // Max is 255
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: longName,
          description: 'Test description',
        })
        .expect(400);
    });
  });

  describe('GET /projects', () => {
    beforeAll(async () => {
      // Create multiple projects for pagination testing
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project Alpha',
          description: 'First test project',
        });

      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project Beta',
          description: 'Second test project',
        });

      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project Gamma',
          description: 'Third test project',
        });
    });

    it('should return paginated projects (200 OK)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toBeDefined();
          expect(res.body.meta.page).toBeDefined();
          expect(res.body.meta.limit).toBeDefined();
          expect(res.body.meta.total).toBeDefined();
          expect(res.body.meta.totalPages).toBeDefined();
        });
    });

    it('should return projects with owner information', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
          const project = res.body.data[0];
          expect(project.id).toBeDefined();
          expect(project.name).toBeDefined();
          expect(project.status).toBeDefined();
          expect(project.owner).toBeDefined();
          expect(project.owner.id).toBeDefined();
          expect(project.owner.name).toBeDefined();
          expect(project.owner.email).toBeDefined();
          expect(project.createdAt).toBeDefined();
          expect(project.updatedAt).toBeDefined();
        });
    });

    it('should support pagination with page and limit parameters', () => {
      return request(app.getHttpServer())
        .get('/projects?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeLessThanOrEqual(2);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(2);
        });
    });

    it('should support search filtering by project name', async () => {
      // Create a project with unique name for search testing
      const uniqueName = `SearchableProject-${Date.now()}`;
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: uniqueName,
          description: 'For search testing',
        });

      return request(app.getHttpServer())
        .get(`/projects?search=${uniqueName}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0].name).toContain(uniqueName);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .expect(401);
    });
  });

  describe('GET /projects/:id', () => {
    let testProjectId: string;

    beforeAll(async () => {
      // Create a project for detail testing
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for Detail Test',
          description: 'Testing project details endpoint',
        });

      testProjectId = response.body.id;
    });

    it('should return project details with task summary (200 OK)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testProjectId);
          expect(res.body.name).toBe('Project for Detail Test');
          expect(res.body.description).toBe('Testing project details endpoint');
          expect(res.body.status).toBe('ACTIVE');
          expect(res.body.owner).toBeDefined();
          expect(res.body.owner.id).toBe(userId);
          expect(res.body.taskSummary).toBeDefined();
          expect(res.body.taskSummary.TODO).toBeDefined();
          expect(res.body.taskSummary.IN_PROGRESS).toBeDefined();
          expect(res.body.taskSummary.DONE).toBeDefined();
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
        });
    });

    it('should return 404 for non-existent project', () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return 400 for invalid UUID format', () => {
      return request(app.getHttpServer())
        .get('/projects/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/projects/${testProjectId}`)
        .expect(401);
    });
  });

  describe('PATCH /projects/:id', () => {
    let ownedProjectId: string;
    let otherUserToken: string;
    let otherUserId: string;

    beforeAll(async () => {
      // Create a project owned by the main test user
      const projectResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for Update Test',
          description: 'Original description',
        });

      ownedProjectId = projectResponse.body.id;

      // Create another user for ownership testing
      const otherEmail = `other-user-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Other User',
          email: otherEmail,
          password: 'password123',
        });

      const otherLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: otherEmail,
          password: 'password123',
        });

      otherUserToken = otherLoginResponse.body.access_token;
      otherUserId = otherLoginResponse.body.user.id;
    });

    it('should update project by owner (200 OK)', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${ownedProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Project Name',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(ownedProjectId);
          expect(res.body.name).toBe('Updated Project Name');
          expect(res.body.description).toBe('Updated description');
          expect(res.body.updatedAt).toBeDefined();
        });
    });

    it('should update only provided fields (partial update)', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${ownedProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Only Name Updated',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Only Name Updated');
          // Description should remain from previous update
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('should update project status to ARCHIVED', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${ownedProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'ARCHIVED',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ARCHIVED');
        });
    });

    it('should return 403 when non-owner tries to update', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${ownedProjectId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Unauthorized Update',
        })
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return 404 for non-existent project', () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .patch(`/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Non-existent',
        })
        .expect(404);
    });

    it('should return 400 for invalid status value', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${ownedProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${ownedProjectId}`)
        .send({
          name: 'Unauthorized Update',
        })
        .expect(401);
    });
  });

  describe('DELETE /projects/:id', () => {
    let projectToDeleteId: string;
    let otherUserToken: string;
    let otherUserProjectId: string;

    beforeAll(async () => {
      // Create a project to delete
      const projectResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project to Delete',
          description: 'This project will be archived',
        });

      projectToDeleteId = projectResponse.body.id;

      // Create another user and their project for ownership testing
      const otherEmail = `delete-test-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Delete Test User',
          email: otherEmail,
          password: 'password123',
        });

      const otherLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: otherEmail,
          password: 'password123',
        });

      otherUserToken = otherLoginResponse.body.access_token;

      const otherProjectResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Other User Project',
          description: 'Owned by other user',
        });

      otherUserProjectId = otherProjectResponse.body.id;
    });

    it('should archive project by owner (204 No Content)', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify project is archived by fetching it
      const getResponse = await request(app.getHttpServer())
        .get(`/projects/${projectToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.status).toBe('ARCHIVED');
    });

    it('should return 403 when non-owner tries to delete', () => {
      return request(app.getHttpServer())
        .delete(`/projects/${otherUserProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should return 404 for non-existent project', () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .delete(`/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/projects/${projectToDeleteId}`)
        .expect(401);
    });

    it('should allow deleting already archived project (idempotent)', async () => {
      // Create a new project to test idempotency
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Idempotent Delete Test',
          description: 'Testing idempotent delete',
        });

      const idempotentProjectId = response.body.id;

      // Delete once
      await request(app.getHttpServer())
        .delete(`/projects/${idempotentProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Delete again - should still return 204
      await request(app.getHttpServer())
        .delete(`/projects/${idempotentProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
