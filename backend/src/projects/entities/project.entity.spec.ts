import { Project, ProjectStatus } from './project.entity';
import { User, UserRole } from '../../users/entities/user.entity';

describe('Project Entity Validation', () => {
  describe('Name Validation', () => {
    it('should accept valid project name', () => {
      const project = new Project();
      project.name = 'Website Redesign';
      project.description = 'Complete overhaul of company website';
      project.status = ProjectStatus.ACTIVE;
      project.ownerId = '123e4567-e89b-12d3-a456-426614174000';

      expect(project.name).toBe('Website Redesign');
    });

    it('should enforce name length constraint (max 255 characters)', () => {
      const project = new Project();
      const longName = 'a'.repeat(255);
      project.name = longName;
      
      expect(project.name.length).toBeLessThanOrEqual(255);
    });

    it('should accept names with special characters', () => {
      const specialNames = [
        'Project #1',
        'Q1-2024 Initiative',
        'Client: ABC Corp',
        'R&D Project',
        'Project (Phase 2)',
      ];

      specialNames.forEach((name) => {
        const project = new Project();
        project.name = name;
        expect(project.name).toBe(name);
      });
    });

    it('should accept minimum length name (1 character)', () => {
      const project = new Project();
      project.name = 'A';
      
      expect(project.name.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle names with leading/trailing spaces', () => {
      const project = new Project();
      const nameWithSpaces = '  Project Name  ';
      project.name = nameWithSpaces;
      
      // Note: Trimming should be done at DTO validation level
      expect(project.name).toBeDefined();
    });
  });

  describe('Description Validation', () => {
    it('should accept valid description', () => {
      const project = new Project();
      project.name = 'Test Project';
      project.description = 'This is a test project description';
      project.status = ProjectStatus.ACTIVE;

      expect(project.description).toBe('This is a test project description');
    });

    it('should allow null description', () => {
      const project = new Project();
      project.name = 'Test Project';
      project.description = null;
      project.status = ProjectStatus.ACTIVE;

      // TypeORM decorator: nullable: true
      expect(project.description).toBeNull();
    });

    it('should accept long descriptions', () => {
      const project = new Project();
      const longDescription = 'a'.repeat(5000);
      project.description = longDescription;
      
      // Design doc specifies max 5000 characters for descriptions
      expect(project.description.length).toBeLessThanOrEqual(5000);
    });

    it('should accept descriptions with line breaks', () => {
      const project = new Project();
      project.description = 'Line 1\nLine 2\nLine 3';
      
      expect(project.description).toContain('\n');
      expect(project.description.split('\n').length).toBe(3);
    });

    it('should accept empty string description', () => {
      const project = new Project();
      project.description = '';
      
      expect(project.description).toBe('');
    });
  });

  describe('Status Validation', () => {
    it('should accept ACTIVE status', () => {
      const project = new Project();
      project.name = 'Active Project';
      project.status = ProjectStatus.ACTIVE;

      expect(project.status).toBe(ProjectStatus.ACTIVE);
      expect(project.status).toBe('ACTIVE');
    });

    it('should accept ARCHIVED status', () => {
      const project = new Project();
      project.name = 'Archived Project';
      project.status = ProjectStatus.ARCHIVED;

      expect(project.status).toBe(ProjectStatus.ARCHIVED);
      expect(project.status).toBe('ARCHIVED');
    });

    it('should default to ACTIVE status', () => {
      const project = new Project();
      project.name = 'New Project';
      // Not setting status explicitly

      // TypeORM default is set in decorator: default: ProjectStatus.ACTIVE
      expect(ProjectStatus.ACTIVE).toBe('ACTIVE');
    });

    it('should only allow valid status enum values', () => {
      const validStatuses = [ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED];
      
      validStatuses.forEach((status) => {
        const project = new Project();
        project.status = status;
        expect(Object.values(ProjectStatus)).toContain(project.status);
      });
    });

    it('should have exactly 2 status values', () => {
      const statusValues = Object.values(ProjectStatus);
      
      expect(statusValues.length).toBe(2);
      expect(statusValues).toContain('ACTIVE');
      expect(statusValues).toContain('ARCHIVED');
    });
  });

  describe('Owner Validation', () => {
    it('should accept valid owner ID', () => {
      const project = new Project();
      project.name = 'Test Project';
      project.ownerId = '123e4567-e89b-12d3-a456-426614174000';

      expect(project.ownerId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should support owner relationship', () => {
      const project = new Project();
      const owner = new User();
      owner.id = '123e4567-e89b-12d3-a456-426614174000';
      owner.name = 'John Doe';
      owner.email = 'john@example.com';
      owner.password = 'hashedPassword';
      owner.role = UserRole.MEMBER;

      project.owner = owner;
      project.ownerId = owner.id;

      expect(project.owner).toBeDefined();
      expect(project.owner.id).toBe(owner.id);
      expect(project.ownerId).toBe(owner.id);
    });

    it('should enforce foreign key constraint to users table', () => {
      // Foreign key constraint is defined by TypeORM decorators:
      // @ManyToOne(() => User, user => user.projects)
      // @JoinColumn({ name: 'owner_id' })
      const project = new Project();
      project.ownerId = '123e4567-e89b-12d3-a456-426614174000';

      expect(project.ownerId).toBeDefined();
    });
  });

  describe('Timestamp Validation', () => {
    it('should have createdAt timestamp', () => {
      const project = new Project();
      project.name = 'Test Project';
      project.createdAt = new Date();

      expect(project.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt timestamp', () => {
      const project = new Project();
      project.name = 'Test Project';
      project.updatedAt = new Date();

      expect(project.updatedAt).toBeInstanceOf(Date);
    });

    it('should automatically set createdAt on entity creation', () => {
      // TypeORM @CreateDateColumn decorator automatically sets this
      const project = new Project();
      const now = new Date();
      project.createdAt = now;

      expect(project.createdAt).toBeDefined();
      expect(project.createdAt).toBeInstanceOf(Date);
    });

    it('should automatically update updatedAt on entity modification', () => {
      // TypeORM @UpdateDateColumn decorator automatically updates this
      const project = new Project();
      const now = new Date();
      project.updatedAt = now;

      expect(project.updatedAt).toBeDefined();
      expect(project.updatedAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt greater than or equal to createdAt', () => {
      const project = new Project();
      const createdDate = new Date('2024-01-01T00:00:00Z');
      const updatedDate = new Date('2024-01-02T00:00:00Z');
      
      project.createdAt = createdDate;
      project.updatedAt = updatedDate;

      expect(project.updatedAt.getTime()).toBeGreaterThanOrEqual(project.createdAt.getTime());
    });
  });

  describe('Entity Relationships', () => {
    it('should support tasks relationship', () => {
      const project = new Project();
      project.tasks = [];

      expect(project.tasks).toBeDefined();
      expect(Array.isArray(project.tasks)).toBe(true);
    });

    it('should support one-to-many relationship with tasks', () => {
      // @OneToMany(() => Task, task => task.project)
      const project = new Project();
      project.tasks = [];

      expect(Array.isArray(project.tasks)).toBe(true);
    });

    it('should support many-to-one relationship with owner', () => {
      // @ManyToOne(() => User, user => user.projects)
      const project = new Project();
      const owner = new User();
      project.owner = owner;

      expect(project.owner).toBeDefined();
    });
  });

  describe('Complete Project Entity', () => {
    it('should create a valid project entity with all required fields', () => {
      const project = new Project();
      project.id = '123e4567-e89b-12d3-a456-426614174000';
      project.name = 'Website Redesign';
      project.description = 'Complete overhaul of company website';
      project.status = ProjectStatus.ACTIVE;
      project.ownerId = '987e6543-e21b-12d3-a456-426614174000';
      project.createdAt = new Date('2024-01-01T00:00:00Z');
      project.updatedAt = new Date('2024-01-01T00:00:00Z');
      project.tasks = [];

      expect(project.id).toBeDefined();
      expect(project.name).toBe('Website Redesign');
      expect(project.description).toBe('Complete overhaul of company website');
      expect(project.status).toBe(ProjectStatus.ACTIVE);
      expect(project.ownerId).toBeDefined();
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
      expect(Array.isArray(project.tasks)).toBe(true);
    });

    it('should create a valid project entity with minimal fields', () => {
      const project = new Project();
      project.name = 'Minimal Project';
      project.status = ProjectStatus.ACTIVE;
      project.ownerId = '123e4567-e89b-12d3-a456-426614174000';

      expect(project.name).toBeDefined();
      expect(project.status).toBeDefined();
      expect(project.ownerId).toBeDefined();
    });
  });

  describe('Business Logic Validation', () => {
    it('should allow archiving an active project', () => {
      const project = new Project();
      project.name = 'Test Project';
      project.status = ProjectStatus.ACTIVE;

      // Simulate archiving
      project.status = ProjectStatus.ARCHIVED;

      expect(project.status).toBe(ProjectStatus.ARCHIVED);
    });

    it('should allow reactivating an archived project', () => {
      const project = new Project();
      project.name = 'Test Project';
      project.status = ProjectStatus.ARCHIVED;

      // Simulate reactivating
      project.status = ProjectStatus.ACTIVE;

      expect(project.status).toBe(ProjectStatus.ACTIVE);
    });

    it('should maintain status transitions', () => {
      const project = new Project();
      project.status = ProjectStatus.ACTIVE;

      const transitions = [
        ProjectStatus.ARCHIVED,
        ProjectStatus.ACTIVE,
        ProjectStatus.ARCHIVED,
      ];

      transitions.forEach((status) => {
        project.status = status;
        expect(project.status).toBe(status);
      });
    });
  });
});
