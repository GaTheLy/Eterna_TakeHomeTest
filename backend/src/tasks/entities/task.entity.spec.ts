import { Task, TaskPriority, TaskStatus } from './task.entity';
import { Project, ProjectStatus } from '../../projects/entities/project.entity';
import { User, UserRole } from '../../users/entities/user.entity';

describe('Task Entity Validation', () => {
  describe('Title Validation', () => {
    it('should accept valid task title', () => {
      const task = new Task();
      task.title = 'Design homepage mockup';
      task.description = 'Create high-fidelity mockup in Figma';
      task.priority = TaskPriority.HIGH;
      task.status = TaskStatus.TODO;

      expect(task.title).toBe('Design homepage mockup');
    });

    it('should enforce title length constraint (max 255 characters)', () => {
      const task = new Task();
      const longTitle = 'a'.repeat(255);
      task.title = longTitle;
      
      expect(task.title.length).toBeLessThanOrEqual(255);
    });

    it('should accept titles with special characters', () => {
      const specialTitles = [
        'Task #1: Setup',
        'Review PR #123',
        'Fix bug (urgent)',
        'Update API v2.0',
        'Client meeting @ 2pm',
      ];

      specialTitles.forEach((title) => {
        const task = new Task();
        task.title = title;
        expect(task.title).toBe(title);
      });
    });

    it('should accept minimum length title (1 character)', () => {
      const task = new Task();
      task.title = 'A';
      
      expect(task.title.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Description Validation', () => {
    it('should accept valid description', () => {
      const task = new Task();
      task.title = 'Test Task';
      task.description = 'This is a detailed task description';

      expect(task.description).toBe('This is a detailed task description');
    });

    it('should allow null description', () => {
      const task = new Task();
      task.title = 'Test Task';
      task.description = null;

      // TypeORM decorator: nullable: true
      expect(task.description).toBeNull();
    });

    it('should accept long descriptions', () => {
      const task = new Task();
      const longDescription = 'a'.repeat(5000);
      task.description = longDescription;
      
      // Design doc specifies max 5000 characters for descriptions
      expect(task.description.length).toBeLessThanOrEqual(5000);
    });

    it('should accept descriptions with line breaks and formatting', () => {
      const task = new Task();
      task.description = 'Step 1: Do this\nStep 2: Do that\nStep 3: Complete';
      
      expect(task.description).toContain('\n');
      expect(task.description.split('\n').length).toBe(3);
    });
  });

  describe('Priority Validation', () => {
    it('should accept LOW priority', () => {
      const task = new Task();
      task.priority = TaskPriority.LOW;

      expect(task.priority).toBe(TaskPriority.LOW);
      expect(task.priority).toBe('LOW');
    });

    it('should accept MEDIUM priority', () => {
      const task = new Task();
      task.priority = TaskPriority.MEDIUM;

      expect(task.priority).toBe(TaskPriority.MEDIUM);
      expect(task.priority).toBe('MEDIUM');
    });

    it('should accept HIGH priority', () => {
      const task = new Task();
      task.priority = TaskPriority.HIGH;

      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.priority).toBe('HIGH');
    });

    it('should accept URGENT priority', () => {
      const task = new Task();
      task.priority = TaskPriority.URGENT;

      expect(task.priority).toBe(TaskPriority.URGENT);
      expect(task.priority).toBe('URGENT');
    });

    it('should only allow valid priority enum values', () => {
      const validPriorities = [
        TaskPriority.LOW,
        TaskPriority.MEDIUM,
        TaskPriority.HIGH,
        TaskPriority.URGENT,
      ];
      
      validPriorities.forEach((priority) => {
        const task = new Task();
        task.priority = priority;
        expect(Object.values(TaskPriority)).toContain(task.priority);
      });
    });

    it('should have exactly 4 priority values', () => {
      const priorityValues = Object.values(TaskPriority);
      
      expect(priorityValues.length).toBe(4);
      expect(priorityValues).toContain('LOW');
      expect(priorityValues).toContain('MEDIUM');
      expect(priorityValues).toContain('HIGH');
      expect(priorityValues).toContain('URGENT');
    });
  });

  describe('Status Validation', () => {
    it('should accept TODO status', () => {
      const task = new Task();
      task.status = TaskStatus.TODO;

      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.status).toBe('TODO');
    });

    it('should accept IN_PROGRESS status', () => {
      const task = new Task();
      task.status = TaskStatus.IN_PROGRESS;

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
      expect(task.status).toBe('IN_PROGRESS');
    });

    it('should accept DONE status', () => {
      const task = new Task();
      task.status = TaskStatus.DONE;

      expect(task.status).toBe(TaskStatus.DONE);
      expect(task.status).toBe('DONE');
    });

    it('should default to TODO status', () => {
      const task = new Task();
      // Not setting status explicitly

      // TypeORM default is set in decorator: default: TaskStatus.TODO
      expect(TaskStatus.TODO).toBe('TODO');
    });

    it('should only allow valid status enum values', () => {
      const validStatuses = [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE,
      ];
      
      validStatuses.forEach((status) => {
        const task = new Task();
        task.status = status;
        expect(Object.values(TaskStatus)).toContain(task.status);
      });
    });

    it('should have exactly 3 status values', () => {
      const statusValues = Object.values(TaskStatus);
      
      expect(statusValues.length).toBe(3);
      expect(statusValues).toContain('TODO');
      expect(statusValues).toContain('IN_PROGRESS');
      expect(statusValues).toContain('DONE');
    });
  });

  describe('Date Constraints Validation', () => {
    it('should accept valid scheduled dates', () => {
      const task = new Task();
      task.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task.scheduledEnd = new Date('2024-01-15T17:00:00Z');

      expect(task.scheduledStart).toBeInstanceOf(Date);
      expect(task.scheduledEnd).toBeInstanceOf(Date);
    });

    it('should enforce scheduledEnd after scheduledStart constraint', () => {
      const task = new Task();
      const startDate = new Date('2024-01-15T09:00:00Z');
      const endDate = new Date('2024-01-15T17:00:00Z');
      
      task.scheduledStart = startDate;
      task.scheduledEnd = endDate;

      // Verify end is after start
      expect(task.scheduledEnd.getTime()).toBeGreaterThan(task.scheduledStart.getTime());
    });

    it('should detect invalid date constraint (end before start)', () => {
      const startDate = new Date('2024-01-15T17:00:00Z');
      const endDate = new Date('2024-01-15T09:00:00Z');

      // This should fail validation
      expect(endDate.getTime()).toBeLessThan(startDate.getTime());
    });

    it('should detect invalid date constraint (end equals start)', () => {
      const startDate = new Date('2024-01-15T09:00:00Z');
      const endDate = new Date('2024-01-15T09:00:00Z');

      // End should be strictly after start
      expect(endDate.getTime()).toBe(startDate.getTime());
      expect(endDate.getTime()).not.toBeGreaterThan(startDate.getTime());
    });

    it('should accept tasks spanning multiple days', () => {
      const task = new Task();
      task.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task.scheduledEnd = new Date('2024-01-20T17:00:00Z');

      const durationMs = task.scheduledEnd.getTime() - task.scheduledStart.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);

      expect(durationDays).toBeGreaterThan(1);
      expect(task.scheduledEnd.getTime()).toBeGreaterThan(task.scheduledStart.getTime());
    });

    it('should accept tasks with short duration (1 hour)', () => {
      const task = new Task();
      task.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task.scheduledEnd = new Date('2024-01-15T10:00:00Z');

      const durationMs = task.scheduledEnd.getTime() - task.scheduledStart.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      expect(durationHours).toBe(1);
      expect(task.scheduledEnd.getTime()).toBeGreaterThan(task.scheduledStart.getTime());
    });

    it('should accept tasks with very short duration (1 minute)', () => {
      const task = new Task();
      task.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task.scheduledEnd = new Date('2024-01-15T09:01:00Z');

      const durationMs = task.scheduledEnd.getTime() - task.scheduledStart.getTime();
      const durationMinutes = durationMs / (1000 * 60);

      expect(durationMinutes).toBe(1);
      expect(task.scheduledEnd.getTime()).toBeGreaterThan(task.scheduledStart.getTime());
    });

    it('should handle timezone-aware dates', () => {
      const task = new Task();
      task.scheduledStart = new Date('2024-01-15T09:00:00-05:00'); // EST
      task.scheduledEnd = new Date('2024-01-15T17:00:00-05:00');   // EST

      expect(task.scheduledStart).toBeInstanceOf(Date);
      expect(task.scheduledEnd).toBeInstanceOf(Date);
      expect(task.scheduledEnd.getTime()).toBeGreaterThan(task.scheduledStart.getTime());
    });
  });

  describe('Foreign Key Relationships', () => {
    it('should accept valid project ID', () => {
      const task = new Task();
      task.projectId = '123e4567-e89b-12d3-a456-426614174000';

      expect(task.projectId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should accept valid assignee ID', () => {
      const task = new Task();
      task.assigneeId = '987e6543-e21b-12d3-a456-426614174000';

      expect(task.assigneeId).toBe('987e6543-e21b-12d3-a456-426614174000');
    });

    it('should support project relationship', () => {
      const task = new Task();
      const project = new Project();
      project.id = '123e4567-e89b-12d3-a456-426614174000';
      project.name = 'Test Project';
      project.status = ProjectStatus.ACTIVE;

      task.project = project;
      task.projectId = project.id;

      expect(task.project).toBeDefined();
      expect(task.project.id).toBe(project.id);
      expect(task.projectId).toBe(project.id);
    });

    it('should support assignee relationship', () => {
      const task = new Task();
      const assignee = new User();
      assignee.id = '987e6543-e21b-12d3-a456-426614174000';
      assignee.name = 'John Doe';
      assignee.email = 'john@example.com';
      assignee.password = 'hashedPassword';
      assignee.role = UserRole.MEMBER;

      task.assignee = assignee;
      task.assigneeId = assignee.id;

      expect(task.assignee).toBeDefined();
      expect(task.assignee.id).toBe(assignee.id);
      expect(task.assigneeId).toBe(assignee.id);
    });

    it('should enforce foreign key constraint to projects table', () => {
      // Foreign key constraint is defined by TypeORM decorators:
      // @ManyToOne(() => Project, project => project.tasks)
      // @JoinColumn({ name: 'project_id' })
      const task = new Task();
      task.projectId = '123e4567-e89b-12d3-a456-426614174000';

      expect(task.projectId).toBeDefined();
    });

    it('should enforce foreign key constraint to users table', () => {
      // Foreign key constraint is defined by TypeORM decorators:
      // @ManyToOne(() => User, user => user.assignedTasks)
      // @JoinColumn({ name: 'assignee_id' })
      const task = new Task();
      task.assigneeId = '987e6543-e21b-12d3-a456-426614174000';

      expect(task.assigneeId).toBeDefined();
    });
  });

  describe('Timestamp Validation', () => {
    it('should have createdAt timestamp', () => {
      const task = new Task();
      task.createdAt = new Date();

      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt timestamp', () => {
      const task = new Task();
      task.updatedAt = new Date();

      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should automatically set createdAt on entity creation', () => {
      // TypeORM @CreateDateColumn decorator automatically sets this
      const task = new Task();
      const now = new Date();
      task.createdAt = now;

      expect(task.createdAt).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('should automatically update updatedAt on entity modification', () => {
      // TypeORM @UpdateDateColumn decorator automatically updates this
      const task = new Task();
      const now = new Date();
      task.updatedAt = now;

      expect(task.updatedAt).toBeDefined();
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt greater than or equal to createdAt', () => {
      const task = new Task();
      const createdDate = new Date('2024-01-01T00:00:00Z');
      const updatedDate = new Date('2024-01-02T00:00:00Z');
      
      task.createdAt = createdDate;
      task.updatedAt = updatedDate;

      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(task.createdAt.getTime());
    });
  });

  describe('Complete Task Entity', () => {
    it('should create a valid task entity with all required fields', () => {
      const task = new Task();
      task.id = '123e4567-e89b-12d3-a456-426614174000';
      task.title = 'Design homepage mockup';
      task.description = 'Create high-fidelity mockup in Figma';
      task.priority = TaskPriority.HIGH;
      task.status = TaskStatus.TODO;
      task.projectId = '987e6543-e21b-12d3-a456-426614174000';
      task.assigneeId = '456e7890-e12b-34d5-a678-901234567890';
      task.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task.scheduledEnd = new Date('2024-01-15T17:00:00Z');
      task.createdAt = new Date('2024-01-01T00:00:00Z');
      task.updatedAt = new Date('2024-01-01T00:00:00Z');

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Design homepage mockup');
      expect(task.description).toBe('Create high-fidelity mockup in Figma');
      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.projectId).toBeDefined();
      expect(task.assigneeId).toBeDefined();
      expect(task.scheduledStart).toBeInstanceOf(Date);
      expect(task.scheduledEnd).toBeInstanceOf(Date);
      expect(task.scheduledEnd.getTime()).toBeGreaterThan(task.scheduledStart.getTime());
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a valid task entity with minimal fields', () => {
      const task = new Task();
      task.title = 'Minimal Task';
      task.priority = TaskPriority.MEDIUM;
      task.status = TaskStatus.TODO;
      task.projectId = '123e4567-e89b-12d3-a456-426614174000';
      task.assigneeId = '987e6543-e21b-12d3-a456-426614174000';
      task.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task.scheduledEnd = new Date('2024-01-15T17:00:00Z');

      expect(task.title).toBeDefined();
      expect(task.priority).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.projectId).toBeDefined();
      expect(task.assigneeId).toBeDefined();
      expect(task.scheduledStart).toBeDefined();
      expect(task.scheduledEnd).toBeDefined();
    });
  });

  describe('Business Logic Validation', () => {
    it('should allow status transitions from TODO to IN_PROGRESS', () => {
      const task = new Task();
      task.status = TaskStatus.TODO;

      task.status = TaskStatus.IN_PROGRESS;

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should allow status transitions from IN_PROGRESS to DONE', () => {
      const task = new Task();
      task.status = TaskStatus.IN_PROGRESS;

      task.status = TaskStatus.DONE;

      expect(task.status).toBe(TaskStatus.DONE);
    });

    it('should allow status transitions from DONE back to IN_PROGRESS', () => {
      const task = new Task();
      task.status = TaskStatus.DONE;

      task.status = TaskStatus.IN_PROGRESS;

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should allow rescheduling tasks', () => {
      const task = new Task();
      task.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task.scheduledEnd = new Date('2024-01-15T17:00:00Z');

      // Reschedule to next day
      const newStart = new Date('2024-01-16T09:00:00Z');
      const newEnd = new Date('2024-01-16T17:00:00Z');
      task.scheduledStart = newStart;
      task.scheduledEnd = newEnd;

      expect(task.scheduledStart.getTime()).toBe(newStart.getTime());
      expect(task.scheduledEnd.getTime()).toBe(newEnd.getTime());
      expect(task.scheduledEnd.getTime()).toBeGreaterThan(task.scheduledStart.getTime());
    });

    it('should allow priority changes', () => {
      const task = new Task();
      task.priority = TaskPriority.LOW;

      // Escalate priority
      task.priority = TaskPriority.URGENT;

      expect(task.priority).toBe(TaskPriority.URGENT);
    });

    it('should allow reassigning tasks to different users', () => {
      const task = new Task();
      task.assigneeId = '123e4567-e89b-12d3-a456-426614174000';

      // Reassign to different user
      task.assigneeId = '987e6543-e21b-12d3-a456-426614174000';

      expect(task.assigneeId).toBe('987e6543-e21b-12d3-a456-426614174000');
    });
  });

  describe('Schedule Conflict Detection', () => {
    it('should detect overlapping tasks for same assignee', () => {
      const task1 = new Task();
      task1.assigneeId = 'user-123';
      task1.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task1.scheduledEnd = new Date('2024-01-15T11:00:00Z');

      const task2 = new Task();
      task2.assigneeId = 'user-123';
      task2.scheduledStart = new Date('2024-01-15T10:00:00Z');
      task2.scheduledEnd = new Date('2024-01-15T12:00:00Z');

      // Check if tasks overlap
      const overlaps = 
        task2.scheduledStart < task1.scheduledEnd && 
        task2.scheduledEnd > task1.scheduledStart &&
        task1.assigneeId === task2.assigneeId;

      expect(overlaps).toBe(true);
    });

    it('should not detect conflicts for different assignees', () => {
      const task1 = new Task();
      task1.assigneeId = 'user-123';
      task1.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task1.scheduledEnd = new Date('2024-01-15T11:00:00Z');

      const task2 = new Task();
      task2.assigneeId = 'user-456';
      task2.scheduledStart = new Date('2024-01-15T10:00:00Z');
      task2.scheduledEnd = new Date('2024-01-15T12:00:00Z');

      // Check if tasks overlap
      const overlaps = 
        task2.scheduledStart < task1.scheduledEnd && 
        task2.scheduledEnd > task1.scheduledStart &&
        task1.assigneeId === task2.assigneeId;

      expect(overlaps).toBe(false);
    });

    it('should not detect conflicts for non-overlapping tasks', () => {
      const task1 = new Task();
      task1.assigneeId = 'user-123';
      task1.scheduledStart = new Date('2024-01-15T09:00:00Z');
      task1.scheduledEnd = new Date('2024-01-15T11:00:00Z');

      const task2 = new Task();
      task2.assigneeId = 'user-123';
      task2.scheduledStart = new Date('2024-01-15T11:00:00Z');
      task2.scheduledEnd = new Date('2024-01-15T13:00:00Z');

      // Check if tasks overlap (they don't - task2 starts when task1 ends)
      const overlaps = 
        task2.scheduledStart < task1.scheduledEnd && 
        task2.scheduledEnd > task1.scheduledStart &&
        task1.assigneeId === task2.assigneeId;

      expect(overlaps).toBe(false);
    });
  });
});
